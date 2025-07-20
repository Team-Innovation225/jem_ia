import logging
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer # Ajout de l'import pour le schéma OAuth2

# Import des modèles de données
from app.base_de_donnees.modeles import DoctorEnDB, MedicalStructureEnDB, UserEnDB

# Import des dépendances (services injectés)
from app.dependances.injection import get_gestionnaire_geolocalisation, get_gestionnaire_authentification
from app.services.gestionnaire_geolocalisation import GestionnaireGeolocalisation
from app.services.gestionnaire_authentification import GestionnaireAuthentification

logger = logging.getLogger(__name__)

# Création du routeur FastAPI
geolocalisation_router = APIRouter()

# Schéma OAuth2 pour la sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# (par exemple, app/dependances/securite.py) pour éviter la duplication.

def get_utilisateur_authentifie(
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
    token: str = Depends(oauth2_scheme)
) -> UserEnDB:
    """Obtient l'utilisateur authentifié à partir du token."""
    return auth_manager.get_utilisateur_actuel_actif(token=token)

def get_utilisateur_par_role_dep(roles: List[str]):
    """
    Retourne une dépendance qui vérifie le rôle de l'utilisateur authentifié.
    Utilisation: Depends(get_utilisateur_par_role_dep(roles=["admin"]))
    """
    def dependency_function(
        auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification),
        token: str = Depends(oauth2_scheme)
    ) -> UserEnDB:
        return auth_manager.get_utilisateur_actuel_par_role(roles=roles, token=token)
    return dependency_function

# --- Fonctions de dépendance pour l'autorisation d'accès aux recherches de géolocalisation ---

async def get_patient_or_doctor_or_admin(
    current_user: UserEnDB = Depends(get_utilisateur_authentifie) # Utilise la dépendance réutilisable
) -> UserEnDB:
    """
    Dépendance pour s'assurer que l'utilisateur est un patient, un médecin ou un administrateur.
    Ces rôles sont autorisés à effectuer des recherches de services.
    """
    if current_user.role not in ["patient", "medecin", "admin"]:
        logger.warning(f"Accès refusé: Rôle '{current_user.role}' non autorisé à effectuer des recherches de géolocalisation.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les autorisations nécessaires pour effectuer cette recherche."
        )
    return current_user

# --- Endpoints pour la recherche par géolocalisation ---

@geolocalisation_router.get(
    "/doctors/nearby",
    response_model=List[DoctorEnDB],
    summary="Rechercher des médecins à proximité",
    description="Recherche et retourne une liste de médecins situés dans un rayon spécifié autour de coordonnées GPS données. Accessible par les patients, médecins et administrateurs."
)
async def search_nearby_doctors(
    latitude: float = Query(..., description="Latitude du point central pour la recherche."),
    longitude: float = Query(..., description="Longitude du point central pour la recherche."),
    rayon_km: Optional[float] = Query(None, gt=0, description="Rayon de recherche en kilomètres. Si non spécifié, utilise la valeur par défaut configurée."),
    geo_manager: GestionnaireGeolocalisation = Depends(get_gestionnaire_geolocalisation),
    current_user: UserEnDB = Depends(get_patient_or_doctor_or_admin) # Vérifie l'autorisation
):
    """
    Recherche les médecins à proximité.
    """
    logger.info(f"Recherche de médecins à proximité de ({latitude}, {longitude}) avec rayon {rayon_km} km par utilisateur {current_user.id}.")
    return await geo_manager.rechercher_medecins_proximite(latitude, longitude, rayon_km)

@geolocalisation_router.get(
    "/medical-structures/nearby",
    response_model=List[MedicalStructureEnDB],
    summary="Rechercher des structures médicales à proximité",
    description="Recherche et retourne une liste de structures médicales (cliniques, hôpitaux, etc.) situées dans un rayon spécifié autour de coordonnées GPS données. Accessible par les patients, médecins et administrateurs."
)
async def search_nearby_medical_structures(
    latitude: float = Query(..., description="Latitude du point central pour la recherche."),
    longitude: float = Query(..., description="Longitude du point central pour la recherche."),
    rayon_km: Optional[float] = Query(None, gt=0, description="Rayon de recherche en kilomètres. Si non spécifié, utilise la valeur par défaut configurée."),
    geo_manager: GestionnaireGeolocalisation = Depends(get_gestionnaire_geolocalisation),
    current_user: UserEnDB = Depends(get_patient_or_doctor_or_admin) # Vérifie l'autorisation
):
    """
    Recherche les structures médicales à proximité.
    """
    logger.info(f"Recherche de structures médicales à proximité de ({latitude}, {longitude}) avec rayon {rayon_km} km par utilisateur {current_user.id}.")
    return await geo_manager.rechercher_structures_medicales_proximite(latitude, longitude, rayon_km)
