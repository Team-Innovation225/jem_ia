import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.security import OAuth2PasswordBearer

# Import des modèles de données
from app.base_de_donnees.modeles import AppointmentCreer, AppointmentEnDB, UserEnDB

# Import des dépendances (services injectés)
from app.dependances.injection import (
    get_gestionnaire_rendezvous,
    get_gestionnaire_authentification,
    get_gestionnaire_patient,
    get_gestionnaire_medecin
)
from app.services.gestionnaire_rendezvous import GestionnaireRendezvous
from app.services.gestionnaire_authentification import GestionnaireAuthentification
from app.services.gestionnaire_patient import GestionnairePatient
from app.services.gestionnaire_medecin import GestionnaireMedecin

logger = logging.getLogger(__name__)

# Création du routeur FastAPI
rendez_vous_router = APIRouter()

# Schéma OAuth2 pour la sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# --- Fonctions de dépendance réutilisables ---
# Ces fonctions sont déplacées ici ou devraient idéalement être dans un fichier commun,
# comme app/dependances/securite.py, pour éviter la duplication de code.

def get_utilisateur_authentifie(
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
    token: str = Depends(oauth2_scheme)
) -> UserEnDB:
    return auth_manager.get_utilisateur_actuel_actif(token=token)

def get_utilisateur_par_role_dep(roles: List[str]):
    def dependency_function(
        auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
        token: str = Depends(oauth2_scheme)
    ) -> UserEnDB:
        return auth_manager.get_utilisateur_actuel_par_role(roles=roles, token=token)
    return dependency_function


# --- Fonctions de dépendance pour l'autorisation d'accès aux rendez-vous ---

async def verifier_acces_rendezvous(
    appointment_id: int,
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
) -> AppointmentEnDB:
    """
    Vérifie si l'utilisateur actuel a le droit d'accéder aux données du rendez-vous spécifié.
    """
    appointment = await rendezvous_manager.obtenir_rendezvous_par_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé.")

    if current_user.role == "patient":
        patient_profile = await patient_manager.obtenir_profil_patient_par_user_id(current_user.id)
        if not patient_profile or patient_profile.id != appointment.patient_id:
            logger.warning(f"Accès refusé: Patient ID {current_user.id} tente d'accéder au rendez-vous {appointment_id} qui ne lui appartient pas.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à ce rendez-vous."
            )
    elif current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente d'accéder au rendez-vous {appointment_id} qui ne lui est pas attribué.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à ce rendez-vous."
            )
    elif current_user.role == "admin":
        pass
    else:
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à accéder aux rendez-vous.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )
    return appointment

# --- Endpoints pour la gestion des rendez-vous ---

@rendez_vous_router.post(
    "/",
    response_model=AppointmentEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau rendez-vous",
    description="Permet de planifier un nouveau rendez-vous entre un patient et un médecin. Accessible par les patients (pour eux-mêmes) et les médecins (pour leurs patients)."
)
async def create_appointment(
    appointment_data: AppointmentCreer,
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
):
    if current_user.role == "patient":
        patient_profile = await patient_manager.obtenir_profil_patient_par_user_id(current_user.id)
        if not patient_profile or patient_profile.id != appointment_data.patient_id:
            logger.warning(f"Accès refusé: Patient ID {current_user.id} tente de créer un rendez-vous pour un autre patient.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez créer un rendez-vous que pour votre propre compte patient."
            )
    elif current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment_data.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de créer un rendez-vous pour un autre médecin.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez créer un rendez-vous que pour vous-même en tant que médecin."
            )
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à créer des rendez-vous.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour créer un rendez-vous."
        )

    logger.info(f"Tentative de création de rendez-vous pour patient {appointment_data.patient_id} avec médecin {appointment_data.doctor_id}.")
    return await rendezvous_manager.creer_rendezvous(appointment_data)

@rendez_vous_router.get(
    "/{appointment_id}",
    response_model=AppointmentEnDB,
    summary="Obtenir un rendez-vous par ID",
    description="Récupère les détails d'un rendez-vous spécifique par son ID. Accessible par le patient concerné, le médecin concerné et les administrateurs."
)
async def get_appointment_by_id(
    appointment: AppointmentEnDB = Depends(verifier_acces_rendezvous)
):
    logger.info(f"Récupération du rendez-vous ID: {appointment.id}")
    return appointment

@rendez_vous_router.get(
    "/patient/{patient_id}",
    response_model=List[AppointmentEnDB],
    summary="Obtenir les rendez-vous d'un patient",
    description="Récupère la liste des rendez-vous associés à un patient. Accessible par le patient lui-même, les médecins (pour leurs patients) et les administrateurs."
)
async def get_appointments_by_patient(
    patient_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient)
):
    if current_user.role == "patient":
        patient_profile = await patient_manager.obtenir_profil_patient_par_user_id(current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            logger.warning(f"Accès refusé: Patient ID {current_user.id} tente de voir les rendez-vous d'un autre patient.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à voir les rendez-vous d'un autre patient."
            )
    elif current_user.role == "medecin":
        pass
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à voir les rendez-vous des patients.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )

    logger.info(f"Récupération des rendez-vous pour patient ID: {patient_id}.")
    return await rendezvous_manager.obtenir_rendezvous_par_patient(patient_id, limit, offset)

@rendez_vous_router.get(
    "/doctor/{doctor_id}",
    response_model=List[AppointmentEnDB],
    summary="Obtenir les rendez-vous d'un médecin",
    description="Récupère la liste des rendez-vous associés à un médecin. Accessible par le médecin lui-même et les administrateurs."
)
async def get_appointments_by_doctor(
    doctor_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
):
    if current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de voir les rendez-vous d'un autre médecin.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à voir les rendez-vous d'un autre médecin."
            )
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à voir les rendez-vous des médecins.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )

    logger.info(f"Récupération des rendez-vous pour médecin ID: {doctor_id}.")
    return await rendezvous_manager.obtenir_rendezvous_par_medecin(doctor_id, limit, offset)

@rendez_vous_router.put(
    "/{appointment_id}",
    response_model=AppointmentEnDB,
    summary="Mettre à jour un rendez-vous",
    description="Met à jour les informations d'un rendez-vous. Accessible par le patient concerné, le médecin concerné et les administrateurs."
)
async def update_appointment(
    appointment_id: int,
    update_data: Dict[str, Any],
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    appointment_check: AppointmentEnDB = Depends(verifier_acces_rendezvous)
):
    logger.info(f"Tentative de mise à jour du rendez-vous ID: {appointment_id}.")
    updated_appointment = await rendezvous_manager.mettre_a_jour_rendezvous(appointment_id, update_data)
    return updated_appointment

@rendez_vous_router.patch(
    "/{appointment_id}/cancel",
    response_model=AppointmentEnDB,
    summary="Annuler un rendez-vous",
    description="Annule un rendez-vous en mettant son statut à 'annule'. Accessible par le patient concerné, le médecin concerné et les administrateurs."
)
async def cancel_appointment(
    appointment_id: int,
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    appointment_check: AppointmentEnDB = Depends(verifier_acces_rendezvous)
):
    logger.info(f"Tentative d'annulation du rendez-vous ID: {appointment_id}.")
    canceled_appointment = await rendezvous_manager.annuler_rendezvous(appointment_id)
    return canceled_appointment

@rendez_vous_router.delete(
    "/{appointment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un rendez-vous",
    description="Supprime un rendez-vous de la base de données. Accessible par le médecin concerné et les administrateurs."
)
async def delete_appointment(
    appointment_id: int,
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
):
    appointment_check = await rendezvous_manager.obtenir_rendezvous_par_id(appointment_id)
    if not appointment_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé.")

    if current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment_check.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de supprimer un rendez-vous qui ne lui est pas attribué.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à supprimer ce rendez-vous."
            )
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à supprimer des rendez-vous.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour supprimer un rendez-vous."
        )

    logger.info(f"Tentative de suppression du rendez-vous ID: {appointment_id}.")
    await rendezvous_manager.supprimer_rendezvous(appointment_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)