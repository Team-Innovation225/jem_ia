import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Security
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials
import os

from app.base_de_donnees.modeles import (
    UserEnDB, LogConversationEnDB,
    MaladieCreer, MaladieEnDB, MaladieMettreAJour,
    SymptomeCreer, SymptomeEnDB, SymptomeMettreAJour,
    MaladieSymptomeLienCreer, MaladieSymptomeLienEnDB
)
from app.dependances.injection import (
    get_moteur_diagnostic,
    get_gestionnaire_connaissances,
    get_gestionnaire_authentification,
    get_gestionnaire_contexte
)
from app.services.moteur_diagnostic import MoteurDiagnostic
from app.services.gestionnaire_connaissances import GestionnaireConnaissances
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.gestionnaire_authentification import GestionnaireAuthentification, oauth2_scheme

# Configuration du logger
logger = logging.getLogger(__name__)

router = APIRouter()

# --- Dépendances pour l'authentification ---
async def get_current_active_user_for_endpoints(
    current_user: UserEnDB = Depends(GestionnaireAuthentification.get_current_active_user)
) -> UserEnDB:
    """
    Dépendance pour obtenir l'utilisateur actif à partir du Firebase ID Token.
    Réutilise la logique d'authentification centralisée.
    """
    return current_user


# --- Points d'terminaux pour la conversation IA et le diagnostic ---

@router.post("/chat/", response_model=Dict[str, Any], summary="Engager une conversation avec l'IA ou lancer un diagnostic")
async def chat_with_ai(
    id_session: str,
    message_utilisateur: Optional[str] = None,
    audio_file: Optional[UploadFile] = File(None),
    moteur_diagnostic: MoteurDiagnostic = Depends(get_moteur_diagnostic),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Permet d'engager une conversation avec l'IA.
    L'entrée peut être du texte ou un fichier audio.
    Si un fichier audio est fourni, il sera transcrit en texte avant traitement.
    """
    logger.info(f"Requête /chat/ reçue pour la session {id_session} par l'utilisateur {current_user.email}")

    chemin_audio = None
    if audio_file:
        # Sauvegarder le fichier audio temporairement
        try:
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            chemin_audio = os.path.join(upload_dir, audio_file.filename)
            with open(chemin_audio, "wb") as buffer:
                buffer.write(await audio_file.read())
            logger.debug(f"Fichier audio sauvegardé temporairement: {chemin_audio}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde du fichier audio: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur lors du traitement du fichier audio.")

    try:
        response = await moteur_diagnostic.traiter_demande_utilisateur(
            id_session=id_session,
            message_utilisateur=message_utilisateur,
            chemin_audio_utilisateur=chemin_audio
        )
        return response
    except HTTPException as e:
        logger.error(f"HTTPException lors de la conversation IA: {e.detail}", exc_info=True)
        raise e
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la conversation IA: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Une erreur est survenue lors du traitement de votre demande.")
    finally:
        # Nettoyer le fichier audio temporaire si existant
        if chemin_audio and os.path.exists(chemin_audio):
            os.remove(chemin_audio)
            logger.debug(f"Fichier audio temporaire supprimé: {chemin_audio}")

@router.get("/audio_response/{filename}", summary="Récupérer un fichier audio de réponse de l'IA")
async def get_audio_response(filename: str):
    """
    Permet de récupérer un fichier audio de réponse de l'IA.
    """
    audio_responses_dir = "audio_reponses"
    file_path = os.path.join(audio_responses_dir, filename)

    if not os.path.exists(file_path):
        logger.warning(f"Fichier audio de réponse non trouvé: {file_path}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fichier audio non trouvé.")
    
    logger.info(f"Fichier audio de réponse demandé: {file_path}")
    return FileResponse(path=file_path, media_type="audio/mpeg", filename=filename)

@router.get("/conversation_history/{id_session}", response_model=List[LogConversationEnDB], summary="Obtenir l'historique d'une session de conversation")
async def get_conversation_history(
    id_session: str,
    gestionnaire_contexte: GestionnaireContexte = Depends(get_gestionnaire_contexte),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Récupère l'historique complet des logs pour une session de conversation donnée.
    """
    logger.info(f"Requête d'historique de conversation pour la session {id_session} par l'utilisateur {current_user.email}")
    try:
        history = await gestionnaire_contexte.lire_logs_conversation_par_session(id_session)
        if not history:
            logger.warning(f"Aucun historique trouvé pour la session {id_session}.")
            return []
        
        logger.info(f"Historique de conversation pour la session {id_session} récupéré avec {len(history)} entrées.")
        return history
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique de conversation pour la session {id_session}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")


# --- Points d'terminaux pour la gestion de la base de connaissances (Maladies et Symptômes) ---

@router.post("/knowledge/maladies/", response_model=MaladieEnDB, summary="Ajouter une nouvelle maladie à la base de connaissances")
async def add_maladie(
    maladie: MaladieCreer,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Ajoute une nouvelle maladie à la base de connaissances médicale.
    Requiert une authentification.
    """
    if current_user.role not in ["admin", "medecin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")

    logger.info(f"Requête d'ajout de maladie par {current_user.email}: {maladie.nom_fr}")
    try:
        new_maladie = await gestionnaire_connaissances.ajouter_maladie(maladie)
        return new_maladie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout de la maladie: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.get("/knowledge/maladies/{nom_maladie}", response_model=MaladieEnDB, summary="Obtenir les détails d'une maladie par son nom")
async def get_maladie_details(
    nom_maladie: str,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Récupère les détails d'une maladie spécifique à partir de la base de connaissances.
    """
    logger.info(f"Requête de détails de maladie pour '{nom_maladie}' par {current_user.email}")
    try:
        maladie = await gestionnaire_connaissances.obtenir_details_maladie(nom_maladie)
        return maladie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des détails de la maladie '{nom_maladie}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.put("/knowledge/maladies/{maladie_id}", response_model=MaladieEnDB, summary="Mettre à jour une maladie existante")
async def update_maladie(
    maladie_id: int,
    maladie_update: MaladieMettreAJour,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Met à jour les informations d'une maladie existante dans la base de connaissances.
    Requiert une authentification (rôle admin/médecin).
    """
    if current_user.role not in ["admin", "medecin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")

    logger.info(f"Requête de mise à jour de maladie ID {maladie_id} par {current_user.email}")
    try:
        updated_maladie = await gestionnaire_connaissances.mettre_a_jour_maladie(maladie_id, maladie_update)
        if not updated_maladie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maladie non trouvée ou mise à jour échouée.")
        return updated_maladie
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de la maladie ID {maladie_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.post("/knowledge/symptomes/", response_model=SymptomeEnDB, summary="Ajouter un nouveau symptôme à la base de connaissances")
async def add_symptome(
    symptome: SymptomeCreer,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Ajoute un nouveau symptôme à la base de connaissances médicale.
    Requiert une authentification.
    """
    if current_user.role not in ["admin", "medecin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")

    logger.info(f"Requête d'ajout de symptôme par {current_user.email}: {symptome.nom_fr}")
    try:
        new_symptome = await gestionnaire_connaissances.ajouter_symptome(symptome)
        return new_symptome
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout du symptôme: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.get("/knowledge/symptomes/{nom_symptome}", response_model=SymptomeEnDB, summary="Obtenir les détails d'un symptôme par son nom")
async def get_symptome_details(
    nom_symptome: str,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Récupère les détails d'un symptôme spécifique à partir de la base de connaissances.
    """
    logger.info(f"Requête de détails de symptôme pour '{nom_symptome}' par {current_user.email}")
    try:
        symptome = await gestionnaire_connaissances.obtenir_details_symptome(nom_symptome)
        return symptome
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des détails du symptôme '{nom_symptome}': {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.put("/knowledge/symptomes/{symptome_id}", response_model=SymptomeEnDB, summary="Mettre à jour un symptôme existant")
async def update_symptome(
    symptome_id: int,
    symptome_update: SymptomeMettreAJour,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Met à jour les informations d'un symptôme existant dans la base de connaissances.
    Requiert une authentification (rôle admin/médecin).
    """
    if current_user.role not in ["admin", "medecin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")

    logger.info(f"Requête de mise à jour de symptôme ID {symptome_id} par {current_user.email}")
    try:
        updated_symptome = await gestionnaire_connaissances.mettre_a_jour_symptome(symptome_id, symptome_update)
        if not updated_symptome:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symptôme non trouvé ou mise à jour échouée.")
        return updated_symptome
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du symptôme ID {symptome_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@router.post("/knowledge/maladie-symptome-liens/", response_model=MaladieSymptomeLienEnDB, summary="Ajouter un lien entre une maladie et un symptôme")
async def add_maladie_symptome_lien(
    lien: MaladieSymptomeLienCreer,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
    current_user: UserEnDB = Depends(get_current_active_user_for_endpoints)
):
    """
    Ajoute un lien entre une maladie et un symptôme dans la base de connaissances.
    Requiert une authentification (rôle admin/médecin).
    """
    if current_user.role not in ["admin", "medecin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès non autorisé.")

    logger.info(f"Requête d'ajout de lien maladie-symptôme par {current_user.email}: maladie_id={lien.maladie_id}, symptome_id={lien.symptome_id}")
    try:
        new_lien = await gestionnaire_connaissances.lier_maladie_symptome(lien.maladie_id, lien.symptome_id, lien.force_lien)
        return new_lien
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout du lien maladie-symptôme: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
