import logging
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

from app.base_de_donnees.modeles import (
    LogConversationEnDB,
    MaladieCreer, MaladieEnDB, MaladieMettreAJour,
    SymptomeCreer, SymptomeEnDB, SymptomeMettreAJour,
    MaladieSymptomeLienCreer, MaladieSymptomeLienEnDB
)
from app.dependances.injection import (
    get_moteur_diagnostic,
    get_gestionnaire_connaissances,
    get_gestionnaire_contexte
)
from app.services.moteur_diagnostic import MoteurDiagnostic
from app.services.gestionnaire_connaissances import GestionnaireConnaissances
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

router = APIRouter()

class FeedbackData(BaseModel):
    message_id: int
    feedback_value: int
    id_session: str

@router.get("/new_session", response_model=Dict[str, str], summary="Générer un nouvel ID de session pour le chat")
async def generate_new_session_id():
    new_session_id = str(uuid.uuid4())
    logger.info(f"Nouvel ID de session généré: {new_session_id}")
    return {"session_id": new_session_id}

@router.post("/chat/", response_model=Dict[str, Any], summary="Engager une conversation avec l'IA ou lancer un diagnostic")
async def chat_with_ai(
    id_session: str,
    message_utilisateur: Optional[str] = None,
    audio_file: Optional[UploadFile] = File(None),
    moteur_diagnostic: MoteurDiagnostic = Depends(get_moteur_diagnostic),
):
    """
    Permet d'engager une conversation avec l'IA.
    L'entrée peut être du texte ou un fichier audio.
    Si un fichier audio est fourni, il sera transcrit en texte avant traitement.
    """
    logger.info(f"Requête /chat/ reçue pour la session {id_session}")

    try:
        response = await moteur_diagnostic.traiter_demande_utilisateur(
            id_session=id_session,
            message_utilisateur=message_utilisateur,
            audio_file_upload=audio_file # Passer l'objet UploadFile directement
        )
        return response
    except HTTPException as e:
        logger.error(f"HTTPException lors de la conversation IA: {e.detail}", exc_info=True)
        raise e
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la conversation IA: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Une erreur est survenue lors du traitement de votre demande.")

@router.get("/audio_response/{filename}", summary="Récupérer un fichier audio de réponse de l'IA")
async def get_audio_response(filename: str):
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
):
    logger.info(f"Requête d'historique de conversation pour la session {id_session}")
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

@router.post("/feedback/", status_code=status.HTTP_200_OK, summary="Enregistrer le feedback utilisateur pour un message de l'IA")
async def record_feedback(
    feedback_data: FeedbackData,
    gestionnaire_contexte: GestionnaireContexte = Depends(get_gestionnaire_contexte)
):
    logger.info(f"Feedback reçu pour message_id={feedback_data.message_id}, session_id={feedback_data.id_session}, value={feedback_data.feedback_value}")
    try:
        success = await gestionnaire_contexte.enregistrer_feedback_conversation(
            message_id=feedback_data.message_id,
            feedback_value=feedback_data.feedback_value
        )
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message de conversation non trouvé pour enregistrer le feedback.")
        return {"message": "Feedback enregistré avec succès."}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement du feedback: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur interne lors de l'enregistrement du feedback.")

@router.post("/knowledge/maladies/", response_model=MaladieEnDB, summary="Ajouter une nouvelle maladie à la base de connaissances")
async def add_maladie(
    maladie: MaladieCreer,
    gestionnaire_connaissances: GestionnaireConnaissances = Depends(get_gestionnaire_connaissances),
):
    logger.info(f"Requête d'ajout de maladie: {maladie.nom_fr}")
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
):
    logger.info(f"Requête de détails de maladie pour '{nom_maladie}'")
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
):
    logger.info(f"Requête de mise à jour de maladie ID {maladie_id}")
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
):
    logger.info(f"Requête d'ajout de symptôme: {symptome.nom_fr}")
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
):
    logger.info(f"Requête de détails de symptôme pour '{nom_symptome}'")
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
):
    logger.info(f"Requête de mise à jour de symptôme ID {symptome_id}")
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
):
    logger.info(f"Requête d'ajout de lien maladie-symptôme: maladie_id={lien.maladie_id}, symptome_id={lien.symptome_id}")
    try:
        new_lien = await gestionnaire_connaissances.lier_maladie_symptome(lien.maladie_id, lien.symptome_id, lien.force_lien)
        return new_lien
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout du lien maladie-symptôme: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
