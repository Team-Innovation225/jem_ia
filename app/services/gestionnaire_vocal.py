import logging
import os
from typing import Dict, Any, Optional
import speech_recognition as sr
from gtts import gTTS
from pydub import AudioSegment # pip install pydub

# Import parameters for configurable directories
from app.configuration.parametres import parametres

# Configure the logger
logger = logging.getLogger(__name__)

class GestionnaireVocal:
    """
    Manages Speech-to-Text (STT) and Text-to-Speech (TTS) functionalities
    using SpeechRecognition and gTTS libraries. These libraries can use
    free services (like Google Web Speech API) but may have usage or
    quality limitations compared to paid cloud services.
    """

    def __init__(self):
        logger.info("GestionnaireVocal initialized with SpeechRecognition and gTTS.")
        self.recognizer = sr.Recognizer()

    async def transcrire_audio_en_texte(self, chemin_audio: str, language_code: str = "fr-FR") -> Optional[str]:
        """
        Transcribes an audio file to text using SpeechRecognition.
        Converts the input file to WAV if necessary.

        Args:
            chemin_audio (str): The path to the audio file to transcribe.
            language_code (str): The BCP-47 language code (e.g., "fr-FR", "en-US").

        Returns:
            Optional[str]: The transcribed text, or None if transcription failed.
        """
        if not os.path.exists(chemin_audio):
            logger.error(f"Fichier audio non trouvé pour la transcription: {chemin_audio}")
            return None # Retourne None si le fichier n'existe pas

        # Détermine si une conversion est nécessaire
        # Le frontend envoie probablement du .webm, SpeechRecognition attend du .wav
        _, file_extension = os.path.splitext(chemin_audio)
        temp_wav_path = None
        audio_to_process = chemin_audio

        if file_extension.lower() != '.wav':
            logger.debug(f"Conversion de {chemin_audio} en WAV pour SpeechRecognition.")
            try:
                # Crée un chemin temporaire pour le fichier WAV dans UPLOAD_DIR
                temp_wav_filename = f"{os.path.basename(chemin_audio).split('.')[0]}.wav"
                temp_wav_path = os.path.join(parametres.UPLOAD_DIR, temp_wav_filename)
                
                audio = AudioSegment.from_file(chemin_audio)
                audio.export(temp_wav_path, format="wav")
                audio_to_process = temp_wav_path
                logger.debug(f"Fichier converti en WAV: {audio_to_process}")
            except Exception as e:
                logger.error(f"Erreur lors de la conversion audio de {chemin_audio} en WAV: {e}", exc_info=True)
                return None # Retourne None en cas d'erreur de conversion

        logger.debug(f"Démarrage de la transcription audio pour: {audio_to_process} (Langue: {language_code})")
        try:
            with sr.AudioFile(audio_to_process) as source:
                self.recognizer.adjust_for_ambient_noise(source)
                audio_data = self.recognizer.record(source)
            
            # NOUVEAU LOG POUR DIAGNOSTIC
            logger.debug(f"Audio data size for recognition: {len(audio_data.frame_data)} bytes")

            # Tente de transcrire l'audio
            texte_transcrit = self.recognizer.recognize_google(audio_data, language=language_code)
            logger.debug(f"Résultat brut de recognize_google: '{texte_transcrit}'") # NOUVEAU LOG

            if not texte_transcrit:
                logger.warning(f"Aucun texte n'a pu être transcrit à partir de: {audio_to_process}")
                return "" # Retourne une chaîne vide si aucun texte n'a été transcrit

            logger.info(f"Transcription terminée. Texte: '{texte_transcrit}'")
            return texte_transcrit
        except sr.UnknownValueError:
            logger.warning(f"SpeechRecognition n'a pas pu comprendre l'audio dans: {audio_to_process}")
            return "" # Retourne une chaîne vide si la parole n'est pas comprise
        except sr.RequestError as e:
            logger.error(f"Impossible de demander des résultats à SpeechRecognition (service indisponible ou limite atteinte): {e}", exc_info=True)
            return None # Retourne None en cas d'erreur de requête de service
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la transcription audio: {e}", exc_info=True)
            return None # Retourne None en cas d'erreurs inattendues
        finally:
            # Nettoie le fichier WAV temporaire si une conversion a eu lieu
            if temp_wav_path and os.path.exists(temp_wav_path):
                os.remove(temp_wav_path)
                logger.debug(f"Fichier WAV temporaire supprimé: {temp_wav_path}")


    async def generer_audio_depuis_texte(self, texte: str, chemin_sortie: str, language_code: str = "fr") -> str:
        """
        Generates an audio file from text using gTTS.

        Args:
            texte (str): The text to convert to audio.
            chemin_sortie (str): The path where the generated audio file will be saved (e.g., "response_ia.mp3").
            language_code (str): The language code (e.g., "fr", "en").

        Returns:
            str: The path to the generated audio file.
        """
        logger.debug(f"Démarrage de la génération audio pour le texte: '{texte[:50]}...' (Langue: {language_code})")
        try:
            tts = gTTS(text=texte, lang=language_code, slow=False)

            # S'assure que le répertoire de sortie existe (en utilisant AUDIO_RESPONSES_DIR configuré)
            repertoire_sortie = os.path.dirname(chemin_sortie)
            if not repertoire_sortie: # Si chemin_sortie est juste un nom de fichier, utilise AUDIO_RESPONSES_DIR par défaut
                repertoire_sortie = parametres.AUDIO_RESPONSES_DIR
                chemin_sortie = os.path.join(repertoire_sortie, chemin_sortie)

            if not os.path.exists(repertoire_sortie):
                os.makedirs(repertoire_sortie)

            tts.save(chemin_sortie)
            logger.info(f"Génération audio terminée. Fichier de sortie: {chemin_sortie}")
            return chemin_sortie
        except Exception as e:
            logger.error(f"Erreur lors de la génération audio avec gTTS: {e}", exc_info=True)
            return ""
