import mysql.connector
from mysql.connector import Error
import os
import logging

from app.configuration.parametres import parametres

logger = logging.getLogger(__name__)

# Configuration de la base de données
DB_CONFIG = {
    'host': parametres.DB_HOST,
    'database': parametres.DB_NAME,
    'user': parametres.DB_USER,
    'password': parametres.DB_PASSWORD,
    'port': parametres.DB_PORT,
}

def get_db_connection():
    """Établit et retourne une connexion à la base de données MySQL."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            logger.debug("Connexion à la base de données MySQL réussie.")
        else:
            logger.error("Connexion à la base de données MySQL échouée.")
            return None
    except Error as e:
        logger.error(f"Erreur lors de la connexion à MySQL : {e}", exc_info=True)
        return None
    return connection

def init_db():
    """
    Initialise la base de données MySQL en exécutant le schéma SQL.
    Crée les tables si elles n'existent pas.
    """
    conn = None
    try:
        # Connexion temporaire sans spécifier de base de données pour la créer si elle n'existe pas
        temp_config = DB_CONFIG.copy()
        db_name = temp_config.pop('database')

        conn = mysql.connector.connect(
            host=temp_config['host'],
            user=temp_config['user'],
            password=temp_config['password'],
            port=temp_config['port']
        )
        cursor = conn.cursor()

        # Création de la base de données si elle n'existe pas
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        logger.info(f"Base de données '{db_name}' vérifiée/créée.")

        cursor.close()
        conn.close()

        # Reconnexion à la base de données spécifique
        conn = get_db_connection()
        cursor = conn.cursor()

        schema_file_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        if not os.path.exists(schema_file_path):
            raise FileNotFoundError(f"Fichier de schéma SQL non trouvé: {schema_file_path}")

        with open(schema_file_path, 'r') as f:
            sql_script = f.read()

        # Exécution de chaque instruction SQL séparément
        for statement in sql_script.split(';'):
            statement = statement.strip()
            if statement:
                try:
                    cursor.execute(statement)
                except Error as e:
                    # Ignorer les erreurs de table déjà existante
                    if "table already exists" not in str(e).lower() and "already exists" not in str(e).lower():
                        logger.warning(f"Erreur lors de l'exécution de la requête SQL: {statement[:100]}... Erreur: {e}")
                    else:
                        logger.debug(f"Table déjà existante, ignoré: {statement[:50]}...")

        conn.commit()
        logger.info("Base de données initialisée avec le schéma SQL.")
    except ConnectionError:
        logger.critical("Impossible d'établir une connexion à MySQL pour l'initialisation de la base de données.")
    except Error as e:
        logger.error(f"Erreur lors de l'initialisation de la base de données : {e}", exc_info=True)
        if conn:
            conn.rollback()
    except FileNotFoundError as e:
        logger.error(f"Erreur: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
            logger.debug("Connexion MySQL fermée après initialisation.")
