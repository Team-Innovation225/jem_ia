# app/api/v1/authentification_router.py
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Security
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.base_de_donnees.modeles import UserEnDB, UserRegisterRequest, FirebaseIdTokenRequest
from app.services.gestionnaire_authentification import GestionnaireAuthentification, oauth2_scheme
from app.dependances.injection import get_gestionnaire_authentification_dep

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/register-firebase/",
    response_model=UserEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Inscription utilisateur via Firebase (Email/Password)",
    description="Crée un nouvel utilisateur avec email, mot de passe et rôle via Firebase Authentication. Synchronise l'utilisateur avec la base locale."
)
async def register_user_firebase(
    user_data: UserRegisterRequest, # email, password, role
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification_dep)
):
    """
    ### Inscription utilisateur
    - **email**: Email de l'utilisateur (unique)
    - **password**: Mot de passe (min. 6 caractères)
    - **role**: Rôle de l'utilisateur (patient, medecin, structure_medicale, admin)
    #### Réponse
    - Retourne l'utilisateur créé (id, email, rôle, firebase_uid)
    - En cas d'erreur, retourne un message détaillé
    """
    logger.info(f"Requête d'enregistrement Firebase reçue pour l'email: {user_data.email} avec le rôle: {user_data.role}")
    try:
        new_user = await auth_manager.enregistrer_utilisateur_firebase_et_db(
            email=user_data.email,
            password=user_data.password,
            role=user_data.role
        )
        return new_user
    except HTTPException as e:
        logger.error(f"Erreur HTTP lors de l'enregistrement Firebase: {e.detail}", exc_info=True)
        raise e
    except Exception as e:
        logger.error(f"Erreur inattendue lors de l'enregistrement Firebase de l'utilisateur: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Une erreur inattendue est survenue lors de l'enregistrement Firebase: {e}"
        )

@router.post(
    "/verify-firebase-id-token/",
    response_model=UserEnDB,
    summary="Vérifier un Firebase ID Token et obtenir les infos utilisateur",
    description="Vérifie le token Firebase envoyé par le frontend et retourne les infos utilisateur synchronisées."
)
async def verify_firebase_id_token_endpoint(
    request_data: FirebaseIdTokenRequest,
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification_dep)
):
    """
    ### Vérification du token Firebase
    - **id_token**: Token JWT Firebase envoyé par le frontend
    #### Réponse
    - Retourne les infos utilisateur (id, email, rôle, firebase_uid)
    - En cas d'échec, retourne une erreur d'authentification
    """
    logger.info(f"Requête de vérification de Firebase ID Token reçue.")
    try:
        # La méthode get_current_active_user gère déjà la vérification du token
        # et la synchronisation avec la DB locale.
        # Nous devons simuler l'objet Request pour qu'elle puisse extraire le token.
        # C'est un peu un hack, mais c'est pour réutiliser la logique de dépendance.
        # Idéalement, cette dépendance serait utilisée directement sur les routes protégées.
        mock_request = Request(scope={"type": "http"})
        mock_request._headers = {"authorization": f"Bearer {request_data.id_token}"}
        
        current_user = await auth_manager.get_current_active_user(mock_request)
        
        logger.info(f"Firebase ID Token vérifié et utilisateur synchronisé: {current_user.email}")
        return current_user

    except HTTPException as e:
        logger.error(f"Erreur HTTP lors de la vérification du Firebase ID Token: {e.detail}", exc_info=True)
        raise e
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la vérification du Firebase ID Token: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Une erreur inattendue est survenue lors de l'authentification Firebase: {e}"
        )

# Wrapper FastAPI pour obtenir l'utilisateur actif
async def get_current_active_user(
    auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification_dep),
    credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme)
) -> UserEnDB:
    return await auth_manager.get_current_active_user(credentials)

# Si besoin d'une dépendance avec rôle (exemple, à adapter selon logique métier)
def get_current_user_with_role(role: str):
    async def dependency(
        auth_manager: GestionnaireAuthentification = Depends(get_gestionnaire_authentification_dep),
        credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme)
    ) -> UserEnDB:
        user = await auth_manager.get_current_active_user(credentials)
        if user.role != role:
            raise HTTPException(status_code=403, detail="Accès interdit: rôle requis")
        return user
    return dependency

@router.get(
    "/users/me/",
    response_model=UserEnDB,
    summary="Obtenir les infos de l'utilisateur actuel",
    description="Retourne les informations de l'utilisateur actuellement authentifié via Firebase."
)
async def read_users_me(
    current_user: UserEnDB = Depends(get_current_active_user)
):
    """
    ### Infos utilisateur actuel
    - Nécessite un token Firebase valide
    #### Réponse
    - Infos utilisateur (id, email, rôle, firebase_uid)
    """
    logger.info(f"Requête des informations utilisateur pour: {current_user.email} via Firebase ID Token.")
    return current_user

authentification_router = router
# Export explicite des dépendances
__all__ = ["authentification_router", "get_current_active_user", "get_current_user_with_role"]

