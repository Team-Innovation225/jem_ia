# app/api/v1/teleassistance.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status, Depends
from fastapi.responses import JSONResponse
import logging
import os
import uuid
import json
import asyncio
from pydub import AudioSegment
from starlette.websockets import WebSocketState # NOUVEAU: Importer WebSocketState
from typing import Dict, Any

# Importer le Moteur de Diagnostic et le Gestionnaire de Contexte (juste les types pour les annotations)
from app.services.moteur_diagnostic import MoteurDiagnostic
from app.services.gestionnaire_contexte import GestionnaireContexte

# Importer les dépendances depuis le nouveau module de dépendances
from app.dependances import get_moteur_diagnostic, get_gestionnaire_contexte

# Configurez le logger
logger = logging.getLogger(__name__)

# Créez un routeur FastAPI pour les endpoints de téléassistance
router = APIRouter()

# Répertoires pour la gestion des fichiers audio (doivent correspondre à main.py)
UPLOAD_DIR = "uploads"
AUDIO_RESPONSES_DIR = "audio_reponses"

# Assurez-vous que les répertoires existent (normalement fait dans main.py lifespan)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_RESPONSES_DIR, exist_ok=True)

# Paramètres pour la détection de silence (ajustez si nécessaire)
SILENCE_DURATION_MS = 1500  # Millisecondes de silence pour déclencher le traitement (temps sans nouveau chunk audio)
CHECK_INTERVAL_MS = 500 # Fréquence à laquelle le backend vérifie le tampon audio pour le silence

class ConnectionManager:
    """Gère les connexions WebSocket actives et leurs états de conversation."""
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.audio_buffers: Dict[str, bytes] = {}
        self.processing_tasks: Dict[str, asyncio.Task] = {}
        self.last_audio_activity_time: Dict[str, float] = {} # Temps de la dernière activité audio (réception de chunk)
        self.processing_lock: Dict[str, asyncio.Lock] = {} # Verrou pour éviter les traitements concurrents

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.audio_buffers[session_id] = b""
        self.last_audio_activity_time[session_id] = asyncio.get_event_loop().time()
        self.processing_lock[session_id] = asyncio.Lock() # Initialiser le verrou
        logger.info(f"Connexion WebSocket acceptée pour la session: {session_id}")

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.audio_buffers:
            del self.audio_buffers[session_id]
        if session_id in self.last_audio_activity_time:
            del self.last_audio_activity_time[session_id]
        if session_id in self.processing_lock:
            del self.processing_lock[session_id]
        # Annuler la tâche de traitement si elle existe
        if session_id in self.processing_tasks and not self.processing_tasks[session_id].done():
            self.processing_tasks[session_id].cancel()
            del self.processing_tasks[session_id]
        logger.info(f"Connexion WebSocket déconnectée pour la session: {session_id}")

    async def send_json(self, session_id: str, message: Dict[str, Any]):
        websocket = self.active_connections.get(session_id)
        # Vérifier l'état de la connexion avant d'envoyer
        if websocket and websocket.client_state == WebSocketState.CONNECTED:
            try:
                await websocket.send_json(message)
            except RuntimeError as e:
                logger.error(f"[{session_id}] Erreur lors de l'envoi JSON: {e}")
                # Ne pas déconnecter ici, laisser le main loop ou le finally le faire

    async def process_accumulated_audio(self, session_id: str, moteur_diagnostic: MoteurDiagnostic):
        """
        Traite immédiatement l'audio accumulé, utilisé par la tâche de fond et par END_CALL.
        """
        async with self.processing_lock[session_id]: # Assurer qu'un seul traitement à la fois
            audio_to_process = self.audio_buffers[session_id]
            self.audio_buffers[session_id] = b"" # Vider le tampon

            if not audio_to_process:
                logger.debug(f"[{session_id}] Pas d'audio à traiter.")
                return

            logger.info(f"[{session_id}] Traitement de {len(audio_to_process)} bytes d'audio accumulé.")

            temp_audio_filename = f"user_audio_{session_id}_{uuid.uuid4().hex}.webm"
            temp_audio_path = os.path.join(UPLOAD_DIR, temp_audio_filename)

            try:
                with open(temp_audio_path, "wb") as f:
                    f.write(audio_to_process)
                logger.info(f"[{session_id}] Audio accumulé sauvegardé temporairement: {temp_audio_path}")

                # Envoyer un signal au frontend que l'IA est en train de réfléchir
                if session_id in self.active_connections: # Vérifier si la connexion est toujours active avant d'envoyer
                    await self.send_json(session_id, {"type": "AI_THINKING", "id_session": session_id})
                    logger.info(f"[{session_id}] Signal AI_THINKING envoyé.")

                # Traiter la demande de l'utilisateur (transcription et réponse IA)
                response_data = await moteur_diagnostic.traiter_demande_utilisateur(
                    id_session=session_id,
                    message_utilisateur=None,
                    chemin_audio_utilisateur=temp_audio_path
                )

                # NOUVEAU LOGGING POUR DEBUG L'AUDIO
                logger.info(f"[{session_id}] Réponse MoteurDiagnostic brute: {response_data}")
                if "chemin_audio_reponse_ia" in response_data:
                    logger.info(f"[{session_id}] Chemin audio réponse IA reçu: {response_data['chemin_audio_reponse_ia']}")
                else:
                    logger.warning(f"[{session_id}] Pas de 'chemin_audio_reponse_ia' dans la réponse du MoteurDiagnostic. Vérifier le service TTS.")


                # Envoyer la transcription de l'utilisateur au frontend
                user_transcription = response_data.get("transcription_utilisateur", "")
                if user_transcription and session_id in self.active_connections:
                    await self.send_json(session_id, {"type": "USER_TRANSCRIPTION", "transcription": user_transcription, "id_session": session_id})
                    logger.info(f"[{session_id}] Transcription utilisateur envoyée: '{user_transcription}'")

                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
                    logger.info(f"[{session_id}] Fichier audio utilisateur temporaire supprimé: {temp_audio_path}")

                if response_data.get("chemin_audio_reponse_ia"):
                    response_data["chemin_audio_reponse_ia"] = f"/audio_reponses/{os.path.basename(response_data['chemin_audio_reponse_ia'])}"
                
                # Ajouter le type de message pour que le frontend sache que c'est une réponse de l'IA
                response_data["type"] = "AI_RESPONSE" 

                if session_id in self.active_connections:
                    await self.send_json(session_id, response_data)
                    logger.info(f"[{session_id}] Réponse IA envoyée via WebSocket.")

            except Exception as e:
                logger.error(f"[{session_id}] Erreur lors du traitement de l'audio accumulé: {e}", exc_info=True)
                if session_id in self.active_connections:
                    try:
                        await self.send_json(session_id, {"type": "AI_ERROR", "reponse_ia": "Désolé, une erreur est survenue lors du traitement de votre message vocal.", "intention_detectee": "erreur", "recommandation_triage": "erreur", "id_session": session_id})
                    except RuntimeError: # Gérer le cas où la connexion est déjà fermée
                        pass
            finally:
                pass

    async def handle_audio_processing_task(self, session_id: str, moteur_diagnostic: MoteurDiagnostic):
        """
        Tâche en arrière-plan pour surveiller l'audio et déclencher le traitement après silence.
        """
        while session_id in manager.active_connections:
            await asyncio.sleep(CHECK_INTERVAL_MS / 1000.0)

            current_time_in_task = asyncio.get_event_loop().time()
            
            if session_id in manager.audio_buffers and manager.audio_buffers[session_id] and \
               (current_time_in_task - manager.last_audio_activity_time[session_id]) * 1000 >= SILENCE_DURATION_MS:
                
                await self.process_accumulated_audio(session_id, moteur_diagnostic)


manager = ConnectionManager()

@router.websocket("/ws/teleassistance")
async def websocket_teleassistance_endpoint(
    websocket: WebSocket,
    moteur_diagnostic: MoteurDiagnostic = Depends(get_moteur_diagnostic),
    gestionnaire_contexte: GestionnaireContexte = Depends(get_gestionnaire_contexte)
):
    """
    Point de terminaison WebSocket pour la téléassistance en temps réel.
    Reçoit des chunks audio, les traite, et renvoie des réponses textuelles et audio.
    """
    session_id = str(uuid.uuid4()) # Générer un ID de session unique pour le WebSocket
    await manager.connect(websocket, session_id)
    
    # Démarrer la tâche de traitement en arrière-plan pour cette session
    manager.processing_tasks[session_id] = asyncio.create_task(
        manager.handle_audio_processing_task(session_id, moteur_diagnostic)
    )

    try:
        while True:
            data = await websocket.receive()
            current_time = asyncio.get_event_loop().time() # Définir current_time ici

            if "bytes" in data:
                audio_chunk = data["bytes"]
                manager.audio_buffers[session_id] += audio_chunk
                manager.last_audio_activity_time[session_id] = current_time
                logger.debug(f"[{session_id}] Reçu un chunk audio. Taille accumulée: {len(manager.audio_buffers[session_id])} bytes.")

            elif "text" in data:
                message_content = json.loads(data["text"])
                message_type = message_content.get("type")
                message_value = message_content.get("value")

                logger.debug(f"[{session_id}] Reçu un message texte via WebSocket: Type='{message_type}', Value='{message_value}'")

                if message_type == "TEXT_MESSAGE" and message_value.strip():
                    logger.info(f"[{session_id}] Traitement du message texte via WebSocket: '{message_value}'")
                    try:
                        # Envoyer un signal au frontend que l'IA est en train de réfléchir
                        if session_id in manager.active_connections:
                            await manager.send_json(session_id, {"type": "AI_THINKING", "id_session": session_id})
                            logger.info(f"[{session_id}] Signal AI_THINKING envoyé pour message texte.")

                        response_data = await moteur_diagnostic.traiter_demande_utilisateur(
                            id_session=session_id,
                            message_utilisateur=message_value,
                            chemin_audio_utilisateur=None
                        )
                        if response_data.get("chemin_audio_reponse_ia"):
                            response_data["chemin_audio_reponse_ia"] = f"/audio_reponses/{os.path.basename(response_data['chemin_audio_reponse_ia'])}"
                        
                        response_data["type"] = "AI_RESPONSE" # Ajouter le type de message

                        if session_id in manager.active_connections:
                            await manager.send_json(session_id, response_data)
                            logger.info(f"[{session_id}] Réponse IA pour message texte envoyée via WebSocket.")
                    except Exception as e:
                        logger.error(f"[{session_id}] Erreur lors du traitement du message texte via WebSocket: {e}", exc_info=True)
                        if session_id in manager.active_connections:
                            try:
                                await manager.send_json(session_id, {"type": "AI_ERROR", "reponse_ia": "Désolé, une erreur est survenue lors du traitement de votre message texte.", "intention_detectee": "erreur", "recommandation_triage": "erreur", "id_session": session_id})
                            except RuntimeError:
                                pass
                
                elif message_type == "END_CALL":
                    logger.info(f"[{session_id}] Signal END_CALL reçu. Préparation à la fermeture.")
                    # Annuler la tâche de traitement en arrière-plan pour cette session
                    if session_id in manager.processing_tasks and not manager.processing_tasks[session_id].done():
                        manager.processing_tasks[session_id].cancel()
                        del manager.processing_tasks[session_id]
                        logger.info(f"[{session_id}] Tâche de traitement en arrière-plan annulée.")

                    # Traiter l'audio restant immédiatement et attendre sa complétion
                    if manager.audio_buffers[session_id]:
                        logger.info(f"[{session_id}] Traitement de l'audio restant avant la fin de l'appel.")
                        # Appeler directement la fonction de traitement, en attendant qu'elle finisse
                        await manager.process_accumulated_audio(session_id, moteur_diagnostic)
                    
                    # Envoyer le message de confirmation de fin d'appel
                    # Cette fonction send_json vérifiera si la connexion est toujours active.
                    await manager.send_json(session_id, {"type": "END_CALL_CONFIRM", "reponse_ia": "Au revoir ! Merci d'avoir utilisé le service de téléassistance.", "intention_detectee": "fin_appel", "recommandation_triage": "fin_appel", "id_session": session_id})
                    logger.info(f"[{session_id}] Message END_CALL_CONFIRM envoyé (tentative).")
                    
                    # Sortir de la boucle pour laisser le bloc finally gérer la déconnexion.
                    break 

    except WebSocketDisconnect:
        logger.info(f"Connexion WebSocket déconnectée pour la session: {session_id}")
    except Exception as e:
        logger.error(f"Erreur inattendue dans le WebSocket pour la session {session_id}: {e}", exc_info=True)
        if session_id in manager.active_connections:
            try:
                await manager.send_json(session_id, {"type": "AI_ERROR", "reponse_ia": "Une erreur inattendue est survenue dans le service de téléassistance. Veuillez réessayer.", "intention_detectee": "erreur", "recommandation_triage": "erreur", "id_session": session_id})
            except RuntimeError:
                pass
    finally:
        manager.disconnect(session_id)
        logger.info(f"Nettoyage des ressources WebSocket pour la session: {session_id}")

