from fastapi.responses import Response 
import logging
from typing import List, Dict, Any, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer

# Import des modèles de données
from app.base_de_donnees.modeles import (
    DoctorCreer, DoctorEnDB, MedicalReportCreer, MedicalReportEnDB,
    ConsultationModuleCreer, ConsultationModuleEnDB, UserEnDB
)

# Import des dépendances (services injectés)
from app.dependances.injection import get_gestionnaire_medecin, get_gestionnaire_authentification
from app.services.gestionnaire_medecin import GestionnaireMedecin
from app.services.gestionnaire_authentification import GestionnaireAuthentification

logger = logging.getLogger(__name__)

# Création du routeur FastAPI
medecin_router = APIRouter()

# Schéma OAuth2 pour la sécurité (utilisé pour le tokenUrl)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# --- Fonctions de dépendance réutilisables ---

# Une fonction d'usine (factory) qui retourne la dépendance pour vérifier le rôle
def get_utilisateur_par_role_dep(roles: List[str]):
    def dependency_function(
        auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
        token: str = Depends(oauth2_scheme)
    ) -> UserEnDB:
        return auth_manager.get_utilisateur_actuel_par_role(roles=roles, token=token)
    return dependency_function

# Une fonction pour obtenir n'importe quel utilisateur authentifié
def get_utilisateur_authentifie(
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
    token: str = Depends(oauth2_scheme)
) -> UserEnDB:
    return auth_manager.get_utilisateur_actuel_actif(token=token)

# --- Fonctions de dépendance pour l'autorisation d'accès aux données médecin ---

async def verifier_acces_medecin(
    doctor_id: int,
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
) -> DoctorEnDB:
    """
    Vérifie si l'utilisateur actuel a le droit d'accéder aux données du médecin spécifié.
    """
    if current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if doctor_profile.id != doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente d'accéder aux données du médecin {doctor_id}.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à ce profil médecin."
            )
        return doctor_profile
    elif current_user.role == "admin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_id(doctor_id)
        if not doctor_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil médecin non trouvé.")
        return doctor_profile
    else:
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à accéder aux données médecin.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )

# --- Endpoints pour la gestion du profil médecin ---

@medecin_router.post(
    "/",
    response_model=DoctorEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un profil médecin",
    description="Permet à un utilisateur avec le rôle 'medecin' de créer son profil détaillé."
)
async def create_doctor_profile(
    doctor_data: DoctorCreer,
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["medecin"]))
):
    if doctor_data.user_id != current_user.id:
        logger.warning(f"Tentative de créer un profil médecin pour un user_id ({doctor_data.user_id}) différent de l'utilisateur authentifié ({current_user.id}).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez créer un profil médecin que pour votre propre compte utilisateur."
        )
    logger.info(f"Tentative de création de profil médecin pour user_id: {current_user.id}")
    return await medecin_manager.creer_profil_medecin(doctor_data)

@medecin_router.get(
    "/me",
    response_model=DoctorEnDB,
    summary="Obtenir le profil du médecin actuel",
    description="Récupère le profil détaillé du médecin actuellement authentifié."
)
async def get_current_doctor_profile(
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["medecin"])),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin)
):
    logger.info(f"Récupération du profil médecin pour user_id: {current_user.id}")
    return await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)

@medecin_router.get(
    "/{doctor_id}",
    response_model=DoctorEnDB,
    summary="Obtenir un profil médecin par ID",
    description="Récupère le profil détaillé d'un médecin par son ID. Accessible par le médecin lui-même et les administrateurs."
)
async def get_doctor_profile_by_id(
    doctor_profile: DoctorEnDB = Depends(verifier_acces_medecin)
):
    logger.info(f"Récupération du profil médecin ID: {doctor_profile.id}")
    return doctor_profile

@medecin_router.put(
    "/{doctor_id}",
    response_model=DoctorEnDB,
    summary="Mettre à jour un profil médecin",
    description="Met à jour les informations d'un profil médecin. Accessible par le médecin lui-même et les administrateurs."
)
async def update_doctor_profile(
    doctor_id: int,
    update_data: Dict[str, Any],
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    doctor_profile_check: DoctorEnDB = Depends(verifier_acces_medecin)
):
    logger.info(f"Tentative de mise à jour du profil médecin ID: {doctor_id}")
    updated_doctor = await medecin_manager.mettre_a_jour_profil_medecin(doctor_id, update_data)
    return updated_doctor

@medecin_router.delete(
    "/{doctor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un profil médecin",
    description="Supprime un profil médecin. Accessible par le médecin lui-même (pour son propre profil) et les administrateurs."
)
async def delete_doctor_profile(
    doctor_id: int,
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["medecin", "admin"]))
):
    if current_user.role == "medecin":
        doctor_profile = await medecin_manager.obtenir_profil_medecin_par_user_id(current_user.id)
        if doctor_profile.id != doctor_id:
            logger.warning(f"Accès refusé: Médecin ID {current_user.id} tente de supprimer le profil du médecin {doctor_id}.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à supprimer ce profil médecin."
            )
    
    logger.info(f"Tentative de suppression du profil médecin ID: {doctor_id}")
    await medecin_manager.supprimer_profil_medecin(doctor_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Endpoints pour les rapports médicaux générés par l'IA ---

@medecin_router.post(
    "/{doctor_id}/medical-reports/generate-ai",
    response_model=MedicalReportEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Générer un rapport médical assisté par l'IA",
    description="Permet à un médecin de générer un rapport médical pour un patient, assisté par l'IA."
)
async def generate_ai_medical_report(
    doctor_id: int,
    patient_id: int,
    type_rapport: str,
    contexte_ia: Dict[str, Any],
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    doctor_profile_check: DoctorEnDB = Depends(verifier_acces_medecin)
):
    if doctor_id != doctor_profile_check.id:
        logger.warning(f"Accès refusé: Médecin ID {doctor_profile_check.id} tente de générer un rapport pour un autre médecin {doctor_id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à générer un rapport pour un autre médecin."
        )
    logger.info(f"Demande de génération de rapport IA pour patient {patient_id} par médecin {doctor_id}, type: {type_rapport}")
    return await medecin_manager.generer_rapport_ia(patient_id, doctor_id, type_rapport, contexte_ia)

@medecin_router.get(
    "/{doctor_id}/medical-reports",
    response_model=List[MedicalReportEnDB],
    summary="Obtenir les rapports médicaux d'un médecin",
    description="Récupère la liste des rapports médicaux générés ou validés par un médecin."
)
async def get_doctor_medical_reports(
    doctor_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    doctor_profile_check: DoctorEnDB = Depends(verifier_acces_medecin)
):
    if doctor_id != doctor_profile_check.id:
        logger.warning(f"Accès refusé: Médecin ID {doctor_profile_check.id} tente d'accéder aux rapports d'un autre médecin {doctor_id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à accéder aux rapports d'un autre médecin."
        )
    logger.info(f"Récupération des rapports médicaux pour médecin ID: {doctor_id}")
    return await medecin_manager.obtenir_rapports_medicaux_medecin(doctor_id, limit, offset)

# --- Endpoints pour les modules de consultation IA ---

@medecin_router.post(
    "/{doctor_id}/consultation-modules",
    response_model=ConsultationModuleEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un module de consultation IA",
    description="Permet à un médecin de créer un module de consultation personnalisé animé par l'IA."
)
async def create_consultation_module(
    doctor_id: int,
    module_data: ConsultationModuleCreer,
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    doctor_profile_check: DoctorEnDB = Depends(verifier_acces_medecin)
):
    if module_data.doctor_id != doctor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'ID médecin dans le corps de la requête ne correspond pas à l'ID dans l'URL."
        )
    if doctor_id != doctor_profile_check.id:
        logger.warning(f"Accès refusé: Médecin ID {doctor_profile_check.id} tente de créer un module pour un autre médecin {doctor_id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à créer un module pour un autre médecin."
        )
    logger.info(f"Création d'un module de consultation IA par médecin ID: {doctor_id}, titre: {module_data.titre}")
    return await medecin_manager.creer_module_consultation_ia(module_data)

@medecin_router.get(
    "/{doctor_id}/consultation-modules",
    response_model=List[ConsultationModuleEnDB],
    summary="Obtenir les modules de consultation d'un médecin",
    description="Récupère la liste des modules de consultation IA créés par un médecin."
)
async def get_doctor_consultation_modules(
    doctor_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    doctor_profile_check: DoctorEnDB = Depends(verifier_acces_medecin)
):
    if doctor_id != doctor_profile_check.id:
        logger.warning(f"Accès refusé: Médecin ID {doctor_profile_check.id} tente d'accéder aux modules d'un autre médecin {doctor_id}.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à accéder aux modules d'un autre médecin."
        )
    logger.info(f"Récupération des modules de consultation IA pour médecin ID: {doctor_id}")
    return await medecin_manager.obtenir_modules_consultation_medecin(doctor_id, limit, offset)

@medecin_router.get(
    "/consultation-modules/public",
    response_model=List[ConsultationModuleEnDB],
    summary="Obtenir les modules de consultation IA publics",
    description="Récupère la liste de tous les modules de consultation IA marqués comme publics, accessibles par tous les médecins."
)
async def get_public_consultation_modules(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    medecin_manager: GestionnaireMedecin = Depends(get_gestionnaire_medecin),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["medecin", "admin"]))
):
    logger.info(f"Récupération des modules de consultation IA publics par utilisateur ID: {current_user.id}, rôle: {current_user.role}")
    return await medecin_manager.obtenir_modules_consultation_publics(limit, offset)