import logging
import os
import uuid
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status, UploadFile # Import UploadFile

# Importation des services nécessaires
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_connaissances import GestionnaireConnaissances
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.gestionnaire_vocal import GestionnaireVocal

logger = logging.getLogger(__name__)

class MoteurDiagnostic:
    def __init__(self, integrateur_llm: IntegrateurLLM, gestionnaire_connaissances: GestionnaireConnaissances,
                 gestionnaire_contexte: GestionnaireContexte, gestionnaire_vocal: GestionnaireVocal):
        self.integrateur_llm = integrateur_llm
        self.gestionnaire_connaissances = gestionnaire_connaissances
        self.gestionnaire_contexte = gestionnaire_contexte
        self.gestionnaire_vocal = gestionnaire_vocal
        logger.info("MoteurDiagnostic initialisé.")

    async def traiter_demande_utilisateur(
        self,
        id_session: str,
        message_utilisateur: Optional[str] = None,
        audio_file_upload: Optional[UploadFile] = None, # Accepte l'objet UploadFile directement
    ) -> Dict[str, Any]:
        """
        Traite la demande de l'utilisateur, qu'elle soit textuelle ou audio.
        Gère la transcription, l'appel LLM, la synthèse vocale et le logging.
        """
        
        chemin_audio_utilisateur = None
        transcription_utilisateur = None
        
        if audio_file_upload:
            logger.info(f"Fichier audio reçu pour la session {id_session}. Lecture des bytes...")
            audio_bytes = await audio_file_upload.read()
            if not audio_bytes:
                logger.error(f"[{id_session}] Le fichier audio fourni est vide.")
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Le fichier audio fourni est vide.")
            
            # Sauvegarder dans un fichier temporaire pour la transcription
            # Utilise un nom de fichier unique pour éviter les conflits
            temp_audio_filename = f"user_audio_{id_session}_{uuid.uuid4().hex}.webm"
            chemin_audio_utilisateur = os.path.join("uploads", temp_audio_filename)
            
            try:
                with open(chemin_audio_utilisateur, "wb") as f:
                    f.write(audio_bytes)
                logger.debug(f"Fichier audio utilisateur temporaire sauvegardé: {chemin_audio_utilisateur}")

                # Transcrire l'audio
                transcription_utilisateur = await self.gestionnaire_vocal.transcrire_audio(chemin_audio_utilisateur)
                logger.info(f"Transcription audio pour session {id_session}: '{transcription_utilisateur}'")
            except Exception as e:
                logger.error(f"Erreur de transcription audio pour session {id_session}: {e}", exc_info=True)
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur lors de la transcription audio.")
            finally:
                # Nettoyer le fichier audio temporaire après transcription
                if os.path.exists(chemin_audio_utilisateur):
                    os.remove(chemin_audio_utilisateur)
                    logger.debug(f"Fichier audio utilisateur temporaire supprimé après transcription: {chemin_audio_utilisateur}")
                    chemin_audio_utilisateur = None # Réinitialiser pour éviter de le passer par erreur plus tard

        # Déterminer le message final de l'utilisateur à envoyer au LLM
        # Si message_utilisateur est fourni, il a priorité. Sinon, utiliser la transcription.
        final_user_message = message_utilisateur if message_utilisateur else transcription_utilisateur

        # Vérifier si une entrée valide a été fournie
        if not final_user_message or final_user_message.strip() == "":
            logger.error(f"[{id_session}] Aucun message utilisateur ou transcription audio valide fourni.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aucun message utilisateur ou enregistrement vocal fourni. Veuillez fournir du texte ou un enregistrement vocal.")

        # Log le message utilisateur
        user_log_id = await self.gestionnaire_contexte.enregistrer_log_conversation(
            id_session=id_session,
            role="user",
            contenu=final_user_message
        )
        logger.debug(f"Message utilisateur loggé (ID: {user_log_id}) pour session {id_session}.")

        # Obtenir l'historique de conversation pour le contexte du LLM
        historique_conversation = await self.gestionnaire_contexte.lire_logs_conversation_par_session(id_session)
        # Formater l'historique pour le LLM (liste de {"role": ..., "content": ...})
        messages_pour_llm = [{"role": log.role, "content": log.contenu} for log in historique_conversation]

        # Appeler le LLM
        llm_response_text = ""
        try:
            llm_response_text = await self.integrateur_llm.generer_reponse_texte(
                messages_pour_llm,
                temperature=0.7,
                max_tokens=500
            )
            logger.info(f"Réponse LLM reçue pour session {id_session}: '{llm_response_text}'")
        except Exception as e:
            logger.error(f"Erreur lors de la génération de la réponse LLM pour session {id_session}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur lors de la génération de la réponse de l'IA.")

        # Synthétiser la réponse audio
        chemin_audio_reponse_ia = None
        try:
            audio_filename = f"ai_response_{id_session}_{uuid.uuid4().hex}.mp3"
            chemin_audio_reponse_ia = os.path.join("audio_reponses", audio_filename)
            await self.gestionnaire_vocal.synthetiser_texte_en_audio(llm_response_text, chemin_audio_reponse_ia)
            logger.info(f"Réponse IA synthétisée en audio: {chemin_audio_reponse_ia}")
        except Exception as e:
            logger.error(f"Erreur de synthèse vocale pour session {id_session}: {e}", exc_info=True)
            # Ne pas lever d'exception ici si l'audio n'est pas critique, mais logguer.
            # L'application peut toujours renvoyer la réponse texte.
            chemin_audio_reponse_ia = None # Assurez-vous qu'il est None si la synthèse échoue.

        # Log la réponse de l'IA
        ai_log_id = await self.gestionnaire_contexte.enregistrer_log_conversation(
            id_session=id_session,
            role="ai",
            contenu=llm_response_text
        )
        logger.debug(f"Réponse IA loggée (ID: {ai_log_id}) pour session {id_session}.")

        return {
            "reponse_ia": llm_response_text,
            "chemin_audio_reponse_ia": chemin_audio_reponse_ia,
            "transcription_utilisateur": transcription_utilisateur, # Inclure la transcription pour l'affichage frontend
            "ai_message_db_id": ai_log_id # Passer l'ID DB pour le feedback
        }
