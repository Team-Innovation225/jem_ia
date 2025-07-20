# app/configuration/parametres.py
import os
import logging
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

class Parametres(BaseSettings):
    """
    Centralise tous les paramètres de configuration de l'application,
    chargés principalement depuis les variables d'environnement (fichier .env).
    Utilise pydantic-settings pour une gestion robuste et typée.
    """
    # Configuration de pydantic-settings pour charger depuis .env
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    # --- Paramètres de la Base de Données ---
    DB_HOST: str = Field("localhost", description="Hôte de la base de données MySQL.")
    DB_USER: str = Field("root", description="Nom d'utilisateur pour la base de données MySQL.")
    DB_PASSWORD: str = Field("", description="Mot de passe pour la base de données MySQL. Laissez vide si non requis.")
    DB_NAME: str = Field("ia_medicale", description="Nom de la base de données MySQL.") # <-- CORRIGÉ ICI
    DB_PORT: int = Field(3306, description="Port de la base de données MySQL.")
    DB_POOL_SIZE: int = Field(10, description="Taille initiale du pool de connexions à la base de données.")
    DB_MAX_OVERFLOW: int = Field(20, description="Nombre maximal de connexions supplémentaires que le pool peut créer.")

    # --- Paramètres des APIs Externes (Firebase) ---
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = Field(..., description="Chemin vers le fichier JSON de la clé de compte de service Firebase.")
    GOOGLE_API_KEY: str = Field("", description="Clé API Google (pour Gemini, Google Maps, etc., si utilisée en dehors de Firebase Auth).")

    # --- Paramètres de l'API de l'application ---
    API_KEY_APP: str = Field(..., description="Clé API principale de l'application pour l'accès sécurisé à certains endpoints.")

    # --- Paramètres de Journalisation (Logging) ---
    LOG_LEVEL: str = Field("INFO", description="Niveau de logging minimum (DEBUG, INFO, WARNING, ERROR, CRITICAL).")
    LOG_FILE_PATH: str = Field("app.log", description="Chemin du fichier où les logs seront écrits.")

    # --- Répertoires de Fichiers ---
    UPLOAD_DIR: str = Field("uploads", description="Répertoire pour les fichiers audio/autres téléchargés par les utilisateurs.")
    AUDIO_RESPONSES_DIR: str = Field("audio_reponses", description="Répertoire pour les fichiers audio générés par l'IA.")

    # --- Paramètres Spécifiques à l'IA/Télémédecine ---
    DIAGNOSTIC_CONFIDENCE_THRESHOLD: float = Field(0.5, description="Seuil de confiance (0.0-1.0) pour que l'IA propose un pré-diagnostic.")
    CONVERSATION_HISTORY_LIMIT: int = Field(10, description="Nombre maximal de messages à récupérer pour l'historique de conversation de l'IA.")
    GEOLOCATION_SEARCH_RADIUS_KM: float = Field(10.0, description="Rayon de recherche en kilomètres pour les services de géolocalisation (médecins, structures).")

# Crée une instance globale des paramètres pour faciliter l'accès
parametres = Parametres()

# Vérification des paramètres critiques au démarrage
if not parametres.FIREBASE_SERVICE_ACCOUNT_KEY_PATH or not os.path.exists(parametres.FIREBASE_SERVICE_ACCOUNT_KEY_PATH):
    logger.error("ERREUR: Le chemin vers le fichier de clé de compte de service Firebase (FIREBASE_SERVICE_ACCOUNT_KEY_PATH) n'est pas défini ou le fichier n'existe pas.")
    # Vous pouvez choisir de lever une exception ici pour empêcher le démarrage
    # raise ValueError("Firebase Service Account Key Path is not configured or file does not exist.")
if not parametres.GOOGLE_API_KEY:
    logger.warning("ATTENTION: La clé API Google (GOOGLE_API_KEY) n'est pas définie. Certaines fonctionnalités LLM pourraient être limitées.")
if not parametres.API_KEY_APP:
    logger.warning("ATTENTION: La clé API de l'application (API_KEY_APP) n'est pas définie. L'accès à l'API pourrait être non sécurisé.")

# Petit test pour vérifier que les paramètres sont chargés
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO) # Configurer le logging pour l'exemple
    print("Paramètres chargés :")
    print(f"DB Host: {parametres.DB_HOST}")
    print(f"DB User: {parametres.DB_USER}")
    print(f"DB Name: {parametres.DB_NAME}")
    print(f"DB Port: {parametres.DB_PORT}")
    print(f"DB Pool Size: {parametres.DB_POOL_SIZE}")
    print(f"DB Max Overflow: {parametres.DB_MAX_OVERFLOW}")
    print(f"Firebase Service Account Key Path: {parametres.FIREBASE_SERVICE_ACCOUNT_KEY_PATH}")
    print(f"Google API Key (masquée): {parametres.GOOGLE_API_KEY[:5]}..." if parametres.GOOGLE_API_KEY else "<NON DÉFINIE>")
    print(f"API Key App (masquée): {parametres.API_KEY_APP[:5]}..." if parametres.API_KEY_APP else "<NON DÉFINIE>")
    print(f"Log Level: {parametres.LOG_LEVEL}")
    print(f"Log File Path: {parametres.LOG_FILE_PATH}")
    print(f"Upload Dir: {parametres.UPLOAD_DIR}")
    print(f"Audio Responses Dir: {parametres.AUDIO_RESPONSES_DIR}")
    print(f"Diagnostic Confidence Threshold: {parametres.DIAGNOSTIC_CONFIDENCE_THRESHOLD}")
    print(f"Conversation History Limit: {parametres.CONVERSATION_HISTORY_LIMIT}")
    print(f"Geolocation Search Radius (KM): {parametres.GEOLOCATION_SEARCH_RADIUS_KM}")

