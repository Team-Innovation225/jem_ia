import logging
from typing import List, Dict, Any, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.security import OAuth2PasswordBearer

# Import des modèles de données
from app.base_de_donnees.modeles import (
    MedicalStructureCreer, MedicalStructureEnDB, ResourceCreer, ResourceEnDB,
    StatisticReportCreer, StatisticReportEnDB, UserEnDB
)

# Import des dépendances (services injectés)
from app.dependances.injection import get_gestionnaire_structure_medicale, get_gestionnaire_authentification
from app.services.gestionnaire_structure_medicale import GestionnaireStructureMedicale
from app.services.gestionnaire_authentification import GestionnaireAuthentification

logger = logging.getLogger(__name__)

# Création du routeur FastAPI
structure_medicale_router = APIRouter()

# Schéma OAuth2 pour la sécurité (utilisé pour le tokenUrl)
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

# --- Fonctions de dépendance pour l'autorisation d'accès aux données de structure ---

async def verifier_acces_structure_medicale(
    structure_id: int,
    current_user: UserEnDB = Depends(get_utilisateur_authentifie),
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale)
) -> MedicalStructureEnDB:
    """
    Vérifie si l'utilisateur actuel a le droit d'accéder aux données de la structure médicale spécifiée.
    """
    if current_user.role == "structure_medicale":
        structure_profile = await structure_manager.obtenir_profil_structure_par_user_id(current_user.id)
        if not structure_profile or structure_profile.id != structure_id:
            logger.warning(f"Accès refusé: Structure ID {current_user.id} tente d'accéder aux données de la structure {structure_id}.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à ce profil de structure médicale."
            )
        return structure_profile
    elif current_user.role == "admin":
        structure_profile = await structure_manager.obtenir_profil_structure_par_id(structure_id)
        if not structure_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil de structure médicale non trouvé.")
        return structure_profile
    else:
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à accéder aux données de structure médicale.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour accéder à ces informations."
        )

# --- Endpoints pour la gestion du profil de structure médicale ---

@structure_medicale_router.post(
    "/",
    response_model=MedicalStructureEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un profil de structure médicale",
    description="Permet à un utilisateur avec le rôle 'structure_medicale' de créer son profil détaillé."
)
async def create_medical_structure_profile(
    structure_data: MedicalStructureCreer,
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale"]))
):
    if structure_data.user_id != current_user.id:
        logger.warning(f"Tentative de créer un profil de structure pour un user_id ({structure_data.user_id}) différent de l'utilisateur authentifié ({current_user.id}).")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez créer un profil de structure médicale que pour votre propre compte utilisateur."
        )
    logger.info(f"Tentative de création de profil de structure médicale pour user_id: {current_user.id}")
    return await structure_manager.creer_profil_structure(structure_data)

@structure_medicale_router.get(
    "/me",
    response_model=MedicalStructureEnDB,
    summary="Obtenir le profil de la structure médicale actuelle",
    description="Récupère le profil détaillé de la structure médicale actuellement authentifiée."
)
async def get_current_medical_structure_profile(
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale"])),
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale)
):
    logger.info(f"Récupération du profil de structure médicale pour user_id: {current_user.id}")
    return await structure_manager.obtenir_profil_structure_par_user_id(current_user.id)

@structure_medicale_router.get(
    "/{structure_id}",
    response_model=MedicalStructureEnDB,
    summary="Obtenir un profil de structure médicale par ID",
    description="Récupère le profil détaillé d'une structure médicale par son ID. Accessible par la structure elle-même et les administrateurs."
)
async def get_medical_structure_profile_by_id(
    structure_profile: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    logger.info(f"Récupération du profil de structure médicale ID: {structure_profile.id}")
    return structure_profile

@structure_medicale_router.put(
    "/{structure_id}",
    response_model=MedicalStructureEnDB,
    summary="Mettre à jour un profil de structure médicale",
    description="Met à jour les informations d'un profil de structure médicale. Accessible par la structure elle-même et les administrateurs."
)
async def update_medical_structure_profile(
    structure_id: int,
    update_data: Dict[str, Any],
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    structure_profile_check: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    logger.info(f"Tentative de mise à jour du profil de structure médicale ID: {structure_id}")
    updated_structure = await structure_manager.mettre_a_jour_profil_structure(structure_id, update_data)
    return updated_structure

@structure_medicale_router.delete(
    "/{structure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un profil de structure médicale",
    description="Supprime un profil de structure médicale. Accessible par la structure elle-même (pour son propre profil) et les administrateurs."
)
async def delete_medical_structure_profile(
    structure_id: int,
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale", "admin"]))
):
    if current_user.role == "structure_medicale":
        structure_profile = await structure_manager.obtenir_profil_structure_par_user_id(current_user.id)
        if not structure_profile or structure_profile.id != structure_id:
            logger.warning(f"Accès refusé: Structure ID {current_user.id} tente de supprimer le profil de la structure {structure_id}.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à supprimer ce profil de structure médicale."
            )
    
    logger.info(f"Tentative de suppression du profil de structure médicale ID: {structure_id}")
    await structure_manager.supprimer_profil_structure(structure_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Endpoints pour la gestion des ressources ---

@structure_medicale_router.post(
    "/{structure_id}/resources",
    response_model=ResourceEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer une ressource pour une structure médicale",
    description="Crée une nouvelle ressource (salle, équipement, personnel) pour une structure médicale donnée. Accessible par la structure elle-même et les administrateurs."
)
async def create_resource_for_structure(
    structure_id: int,
    resource_data: ResourceCreer,
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    structure_profile_check: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    if resource_data.structure_id != structure_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'ID de la structure dans le corps de la requête ne correspond pas à l'ID dans l'URL."
        )
    logger.info(f"Création de ressource pour structure ID: {structure_id}, nom: {resource_data.nom_ressource}")
    return await structure_manager.creer_ressource(resource_data)

@structure_medicale_router.get(
    "/{structure_id}/resources",
    response_model=List[ResourceEnDB],
    summary="Obtenir les ressources d'une structure médicale",
    description="Récupère la liste des ressources (salles, équipements, personnel) associées à une structure médicale. Accessible par la structure elle-même et les administrateurs."
)
async def get_resources_for_structure(
    structure_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    structure_profile_check: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    logger.info(f"Récupération des ressources pour structure ID: {structure_id}")
    return await structure_manager.obtenir_ressources_par_structure(structure_id, limit, offset)

@structure_medicale_router.get(
    "/resources/{resource_id}",
    response_model=ResourceEnDB,
    summary="Obtenir une ressource par ID",
    description="Récupère une ressource spécifique par son ID. Accessible par la structure propriétaire et les administrateurs."
)
async def get_resource_by_id(
    resource_id: int,
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale", "admin"]))
):
    resource = await structure_manager.obtenir_ressource_par_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ressource non trouvée.")
    
    # La logique d'autorisation est maintenant simplifiée
    if current_user.role == "structure_medicale":
        structure_profile_for_resource = await structure_manager.obtenir_profil_structure_par_id(resource.structure_id)
        if not structure_profile_for_resource or structure_profile_for_resource.user_id != current_user.id:
            logger.warning(f"Accès refusé: Structure ID {current_user.id} tente d'accéder à la ressource {resource_id} d'une autre structure.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à cette ressource."
            )

    logger.info(f"Récupération de la ressource ID: {resource_id}")
    return resource

@structure_medicale_router.put(
    "/resources/{resource_id}",
    response_model=ResourceEnDB,
    summary="Mettre à jour une ressource",
    description="Met à jour les informations d'une ressource. Accessible par la structure propriétaire et les administrateurs."
)
async def update_resource(
    resource_id: int,
    update_data: Dict[str, Any],
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale", "admin"]))
):
    resource = await structure_manager.obtenir_ressource_par_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ressource non trouvée pour la mise à jour.")
    
    if current_user.role == "structure_medicale":
        structure_profile_for_resource = await structure_manager.obtenir_profil_structure_par_id(resource.structure_id)
        if not structure_profile_for_resource or structure_profile_for_resource.user_id != current_user.id:
            logger.warning(f"Accès refusé: Structure ID {current_user.id} tente de mettre à jour la ressource {resource_id} d'une autre structure.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à modifier cette ressource."
            )

    logger.info(f"Tentative de mise à jour de la ressource ID: {resource_id}")
    updated_resource = await structure_manager.mettre_a_jour_ressource(resource_id, update_data)
    return updated_resource

@structure_medicale_router.delete(
    "/resources/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une ressource",
    description="Supprime une ressource. Accessible par la structure propriétaire et les administrateurs."
)
async def delete_resource(
    resource_id: int,
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    current_user: UserEnDB = Depends(get_utilisateur_par_role_dep(roles=["structure_medicale", "admin"]))
):
    resource = await structure_manager.obtenir_ressource_par_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ressource non trouvée pour la suppression.")
    
    if current_user.role == "structure_medicale":
        structure_profile_for_resource = await structure_manager.obtenir_profil_structure_par_id(resource.structure_id)
        if not structure_profile_for_resource or structure_profile_for_resource.user_id != current_user.id:
            logger.warning(f"Accès refusé: Structure ID {current_user.id} tente de supprimer la ressource {resource_id} d'une autre structure.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à supprimer cette ressource."
            )

    logger.info(f"Tentative de suppression de la ressource ID: {resource_id}")
    await structure_manager.supprimer_ressource(resource_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Endpoints pour les rapports statistiques ---

@structure_medicale_router.post(
    "/{structure_id}/statistic-reports/generate",
    response_model=StatisticReportEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Générer un rapport statistique pour une structure",
    description="Génère un rapport statistique basé sur les données de la structure et l'analyse de l'IA. Accessible par la structure elle-même et les administrateurs."
)
async def generate_statistic_report(
    structure_id: int,
    type_rapport: str = Query(..., description="Type de rapport (ex: 'mensuel_patients', 'rendez_vous_medecin')"),
    periode_debut: date = Query(..., description="Date de début de la période du rapport (YYYY-MM-DD)"),
    periode_fin: date = Query(..., description="Date de fin de la période du rapport (YYYY-MM-DD)"),
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    structure_profile_check: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    logger.info(f"Demande de génération de rapport statistique pour structure ID: {structure_id}, type: {type_rapport}, période: {periode_debut} à {periode_fin}")
    return await structure_manager.generer_rapport_statistique(structure_id, type_rapport, periode_debut, periode_fin)

@structure_medicale_router.get(
    "/{structure_id}/statistic-reports",
    response_model=List[StatisticReportEnDB],
    summary="Obtenir les rapports statistiques d'une structure",
    description="Récupère la liste des rapports statistiques générés pour une structure médicale. Accessible par la structure elle-même et les administrateurs."
)
async def get_statistic_reports_for_structure(
    structure_id: int,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    structure_manager: GestionnaireStructureMedicale = Depends(get_gestionnaire_structure_medicale),
    structure_profile_check: MedicalStructureEnDB = Depends(verifier_acces_structure_medicale)
):
    logger.info(f"Récupération des rapports statistiques pour structure ID: {structure_id}")
    return await structure_manager.obtenir_rapports_statistiques_structure(structure_id, limit, offset)