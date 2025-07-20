import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer

# Import des modèles de données
from app.base_de_donnees.modeles import TeleconsultationSessionCreer, TeleconsultationSessionEnDB, UserEnDB
# Import des dépendances (services injectés)
from app.dependances.injection import (
    get_gestionnaire_telemedecine,
    get_gestionnaire_authentification,
    get_gestionnaire_patient,
    get_gestionnaire_medecin,
    get_gestionnaire_rendezvous
)
from app.services.gestionnaire_telemedecine import GestionnaireTelemedecine
from app.services.gestionnaire_authentification import GestionnaireAuthentification
from app.services.gestionnaire_patient import GestionnairePatient
# Correction de la coquille ici
from app.services.gestionnaire_medecin import GestionnaireMedecin
from app.services.gestionnaire_rendezvous import GestionnaireRendezvous

logger = logging.getLogger(__name__)

# Création du routeur FastAPI
telemedecine_router_v2 = APIRouter()

# Schéma OAuth2 pour la sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# --- Fonctions de dépendance réutilisables ---

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

# --- Fonctions de dépendance pour l'autorisation d'accès aux sessions de téléconsultation ---

async def verifier_acces_teleconsultation_session(
    session_id: int,
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    telemedecine_manager: GestionnaireTelemedecine = Depends(get_gestionnaire_telemedecine),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous)
) -> TeleconsultationSessionEnDB:
    """
    Vérifie si l'utilisateur actuel a le droit d'accéder aux données de la session de téléconsultation spécifiée.
    """
    session = await telemedecine_manager.obtenir_session_teleconsultation_par_id(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session de téléconsultation non trouvée.")

    appointment = await rendezvous_manager.obtenir_rendezvous_par_id(session.appointment_id)
    if not appointment:
        logger.error(f"Rendez-vous {session.appointment_id} introuvable pour la session {session_id}.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Rendez-vous associé introuvable.")

    if current_user.role == "patient":
        patient_profile = await patient_manager.obtenir_profil_patient_par_user_id(current_user.id)
        if not patient_profile or patient_profile.id != appointment.patient_id:
            logger.warning(f"Accès refusé: Patient ID {current_user.id} tente d'accéder à la session {session_id} qui ne lui est pas liée.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à cette session de téléconsultation."
            )
    elif current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente d'accéder à la session {session_id} qui ne lui est pas attribuée.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à cette session de téléconsultation."
            )
    elif current_user.role == "admin":
        pass
    else:
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à accéder aux sessions de téléconsultation.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )
    return session

# --- Endpoints pour la gestion des sessions de téléconsultation ---

@telemedecine_router_v2.post(
    "/",
    response_model=TeleconsultationSessionEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une nouvelle session de téléconsultation",
    description="Crée une nouvelle session de téléconsultation liée à un rendez-vous existant. Accessible par les médecins ou les administrateurs."
)
async def create_teleconsultation_session(
    session_data: TeleconsultationSessionCreer,
    telemedecine_manager: GestionnaireTelemedecine = Depends(get_gestionnaire_telemedecine),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["medecin", "admin"])),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
):
    if current_user.role == "medecin":
        appointment = await rendezvous_manager.obtenir_rendezvous_par_id(session_data.appointment_id)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous associé non trouvé.")
        
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de créer une session pour un rendez-vous qui ne lui est pas attribué.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à créer une session pour ce rendez-vous."
            )

    logger.info(f"Tentative de création de session de téléconsultation pour rendez-vous ID: {session_data.appointment_id}.")
    return await telemedecine_manager.creer_session_teleconsultation(session_data)

@telemedecine_router_v2.get(
    "/{session_id}",
    response_model=TeleconsultationSessionEnDB,
    summary="Obtenir une session de téléconsultation par ID",
    description="Récupère les détails d'une session de téléconsultation spécifique par son ID. Accessible par le patient, le médecin liés et les administrateurs."
)
async def get_teleconsultation_session_by_id(
    session: TeleconsultationSessionEnDB = Depends(verifier_acces_teleconsultation_session)
):
    logger.info(f"Récupération de la session de téléconsultation ID: {session.id}.")
    return session

@telemedecine_router_v2.put(
    "/{session_id}",
    response_model=TeleconsultationSessionEnDB,
    summary="Mettre à jour une session de téléconsultation",
    description="Met à jour les informations d'une session de téléconsultation. Accessible par le médecin lié et les administrateurs."
)
async def update_teleconsultation_session(
    session_id: int,
    update_data: Dict[str, Any],
    telemedecine_manager: GestionnaireTelemedecine = Depends(get_gestionnaire_telemedecine),
    session_check: TeleconsultationSessionEnDB = Depends(verifier_acces_teleconsultation_session),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous)
):
    if current_user.role == "medecin":
        appointment = await rendezvous_manager.obtenir_rendezvous_par_id(session_check.appointment_id)
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de mettre à jour la session {session_id} qui ne lui est pas attribuée.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à modifier cette session de téléconsultation."
            )
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à modifier les sessions de téléconsultation.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour modifier cette session de téléconsultation."
        )

    logger.info(f"Tentative de mise à jour de la session de téléconsultation ID: {session_id}.")
    updated_session = await telemedecine_manager.mettre_a_jour_session_teleconsultation(session_id, update_data)
    return updated_session

@telemedecine_router_v2.patch(
    "/{session_id}/terminate",
    response_model=TeleconsultationSessionEnDB,
    summary="Terminer une session de téléconsultation",
    description="Termine une session de téléconsultation en mettant à jour son statut et en ajoutant la transcription et les notes finales. Accessible par le médecin lié et les administrateurs."
)
async def terminate_teleconsultation_session(
    session_id: int,
    transcription_texte: Optional[str] = Form(None, description="Transcription complète de la session."),
    notes_medecin: Optional[str] = Form(None, description="Notes finales du médecin."),
    telemedecine_manager: GestionnaireTelemedecine = Depends(get_gestionnaire_telemedecine),
    session_check: TeleconsultationSessionEnDB = Depends(verifier_acces_teleconsultation_session),
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    rendezvous_manager: GestionnaireRendezvous = Depends(get_gestionnaire_rendezvous)
):
    if current_user.role == "medecin":
        appointment = await rendezvous_manager.obtenir_rendezvous_par_id(session_check.appointment_id)
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if not doctor_profile or doctor_profile.id != appointment.doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de terminer la session {session_id} qui ne lui est pas attribuée.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à terminer cette session de téléconsultation."
            )
    elif current_user.role != "admin":
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à terminer les sessions de téléconsultation.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour terminer cette session de téléconsultation."
        )

    logger.info(f"Tentative de terminer la session de téléconsultation ID: {session_id}.")
    return await telemedecine_manager.terminer_session_teleconsultation(session_id, transcription_texte, notes_medecin)