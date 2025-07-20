import logging
from logging.handlers import RotatingFileHandler
import os

def configurer_logger(niveau_log: str = "INFO", chemin_fichier_log: str = "app.log"):
    """
    Configure le système de journalisation (logging) de l'application.

    Args:
        niveau_log (str): Le niveau de log minimum à capturer (ex: "INFO", "DEBUG", "WARNING", "ERROR").
        chemin_fichier_log (str): Le chemin complet vers le fichier où les logs seront écrits.
    """
    # Crée le dossier des journaux s'il n'existe pas
    log_dir = os.path.dirname(chemin_fichier_log)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Récupère le logger racine
    root_logger = logging.getLogger()
    root_logger.setLevel(niveau_log.upper())

    # S'assure de ne pas ajouter plusieurs handlers si la fonction est appelée plusieurs fois
    if not root_logger.handlers:
        # Handler pour la console (affichage dans le terminal)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(niveau_log.upper())
        # Format plus concis pour la console
        formatter_console = logging.Formatter('%(levelname)s:     %(name)s - %(message)s')
        console_handler.setFormatter(formatter_console)
        root_logger.addHandler(console_handler)

        # Handler pour le fichier (enregistrement dans un fichier avec rotation)
        file_handler = RotatingFileHandler(
            chemin_fichier_log,
            maxBytes=5 * 1024 * 1024, # 5 MB
            backupCount=5, # Garde 5 fichiers de backup
            encoding='utf-8'
        )
        file_handler.setLevel(niveau_log.upper())
        # Format plus détaillé pour le fichier de log
        formatter_file = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s:%(module)s:%(funcName)s():%(lineno)d - %(message)s')
        file_handler.setFormatter(formatter_file)
        root_logger.addHandler(file_handler)

    # Configure les loggers spécifiques pour propager leurs messages au logger racine
    # Cela évite la duplication des messages si le logger racine est déjà configuré.
    logging.getLogger("uvicorn").propagate = True
    logging.getLogger("uvicorn.access").propagate = True
    logging.getLogger("uvicorn.error").propagate = True
    logging.getLogger("mysql.connector").propagate = True

    # Log un message de confirmation de la configuration
    root_logger.info(f"Système de journalisation configuré. Niveau: {niveau_log}, Fichier: {chemin_fichier_log}")

# Exemple d'utilisation (pour tests directs)
if __name__ == "__main__":
    # Pour ce test, nous allons simuler le chargement des paramètres
    class MockParametres:
        def __init__(self):
            self.LOG_LEVEL = "DEBUG"
            self.LOG_FILE_PATH = "test_app.log"
    
    mock_parametres = MockParametres()
    configurer_logger(mock_parametres.LOG_LEVEL, mock_parametres.LOG_FILE_PATH)

    logger = logging.getLogger(__name__) # Obtenir un logger pour ce module de test

    logger.debug("Ceci est un message de débogage.")
    logger.info("Ceci est un message d'information.")
    logger.warning("Ceci est un message d'avertissement.")
    logger.error("Ceci est un message d'erreur.")
    logger.critical("Ceci est un message critique.")

    try:
        1 / 0
    except ZeroDivisionError:
        logger.exception("Une erreur de division par zéro est survenue.")

    print(f"Vérifiez le fichier '{mock_parametres.LOG_FILE_PATH}' pour les logs.")
