# app/services/gestionnaire_vocal.py
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

    async def transcrire_audio_en_texte(self, chemin_audio: str, language_code: str = "fr-FR") -> str:
        """
        Transcribes an audio file to text using SpeechRecognition.
        Converts the input file to WAV if necessary.

        Args:
            chemin_audio (str): The path to the audio file to transcribe.
            language_code (str): The BCP-47 language code (e.g., "fr-FR", "en-US").

        Returns:
            str: The transcribed text.
        """
        if not os.path.exists(chemin_audio):
            logger.error(f"Audio file not found for transcription: {chemin_audio}")
            return "Désolé, je n'ai pas pu trouver le fichier audio."

        # Determine if conversion is needed
        # Frontend likely sends .webm, SpeechRecognition expects .wav
        _, file_extension = os.path.splitext(chemin_audio)
        temp_wav_path = None
        audio_to_process = chemin_audio

        if file_extension.lower() != '.wav':
            logger.debug(f"Converting {chemin_audio} to WAV for SpeechRecognition.")
            try:
                # Create a temporary path for the WAV file in UPLOAD_DIR
                temp_wav_filename = f"{os.path.basename(chemin_audio).split('.')[0]}.wav"
                temp_wav_path = os.path.join(parametres.UPLOAD_DIR, temp_wav_filename)
                
                audio = AudioSegment.from_file(chemin_audio)
                audio.export(temp_wav_path, format="wav")
                audio_to_process = temp_wav_path
                logger.debug(f"File converted to WAV: {audio_to_process}")
            except Exception as e:
                logger.error(f"Error converting audio from {chemin_audio} to WAV: {e}", exc_info=True)
                return "Désolé, une erreur est survenue lors de la préparation de votre message vocal."

        logger.debug(f"Starting audio transcription for: {audio_to_process} (Language: {language_code})")
        try:
            with sr.AudioFile(audio_to_process) as source:
                self.recognizer.adjust_for_ambient_noise(source)
                audio_data = self.recognizer.record(source)

            texte_transcrit = self.recognizer.recognize_google(audio_data, language=language_code)

            if not texte_transcrit:
                logger.warning(f"No text could be transcribed from: {audio_to_process}")
                return "Désolé, je n'ai pas bien compris votre message vocal. Pourriez-vous répéter plus clairement ?"

            logger.info(f"Transcription completed. Text: '{texte_transcrit}'")
            return texte_transcrit
        except sr.UnknownValueError:
            logger.warning(f"SpeechRecognition could not understand audio in: {audio_to_process}")
            return "Désolé, je n'ai pas bien compris votre message vocal. Pourriez-vous répéter plus clairement ?"
        except sr.RequestError as e:
            logger.error(f"Could not request results from SpeechRecognition (service unavailable or limit reached): {e}", exc_info=True)
            return "Désolé, le service de reconnaissance vocale est momentanément indisponible. Veuillez réessayer."
        except Exception as e:
            logger.error(f"Unexpected error during audio transcription: {e}", exc_info=True)
            return "Désolé, une erreur est survenue lors de la transcription de votre message vocal."
        finally:
            # Clean up temporary WAV file if conversion occurred
            if temp_wav_path and os.path.exists(temp_wav_path):
                os.remove(temp_wav_path)
                logger.debug(f"Temporary WAV file deleted: {temp_wav_path}")


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
        logger.debug(f"Starting audio generation for text: '{texte[:50]}...' (Language: {language_code})")
        try:
            tts = gTTS(text=texte, lang=language_code, slow=False)

            # Ensure output directory exists (using configured AUDIO_RESPONSES_DIR)
            repertoire_sortie = os.path.dirname(chemin_sortie)
            if not repertoire_sortie: # If chemin_sortie is just a filename, default to AUDIO_RESPONSES_DIR
                repertoire_sortie = parametres.AUDIO_RESPONSES_DIR
                chemin_sortie = os.path.join(repertoire_sortie, chemin_sortie)

            if not os.path.exists(repertoire_sortie):
                os.makedirs(repertoire_sortie)

            tts.save(chemin_sortie)
            logger.info(f"Audio generation completed. Output file: {chemin_sortie}")
            return chemin_sortie
        except Exception as e:
            logger.error(f"Error during audio generation with gTTS: {e}", exc_info=True)
            return ""
