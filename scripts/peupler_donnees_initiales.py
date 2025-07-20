# scripts/peupler_donnees_initiales.py
import sys
import os
import csv
from dotenv import load_dotenv
import logging
import mysql.connector

# Add the parent directory to PYTHONPATH for relative imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load environment variables at the beginning of the script
load_dotenv()

# Import necessary modules after loading environment variables
from app.base_de_donnees.connexion import get_db_connection, close_db_connection, creer_pool_connexions
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import MaladieCreer, SymptomeCreer, MaladieSymptomeLienCreer
from app.utilitaires.journalisation import configurer_logger
from app.configuration.parametres import parametres

# Configure the logger for this script
logger = logging.getLogger(__name__)

# La fonction vider_tables_base_de_donnees() est supprimée car l'utilisateur ne souhaite plus de vidage automatique.
# Si un vidage est nécessaire, il devra être effectué manuellement via une console MySQL.


def peupler_maladies_depuis_csv(chemin_fichier_csv: str) -> int:
    """
    Reads disease data from a CSV file and inserts it into the database.
    Fields not present in the CSV will be filled with default values or None.
    This CSV is intended to be populated with data from reliable sources like ICD-10/11.

    Returns:
        int: The number of new diseases inserted.
    """
    maladies_a_inserer = []
    inserted_count = 0
    try:
        with open(chemin_fichier_csv, mode='r', encoding='utf-8') as fichier_csv:
            lecteur_csv = csv.DictReader(fichier_csv)
            for ligne in lecteur_csv:
                # Map CSV data to MaladieCreer model fields
                # Fields not present in the CSV are set with default values or None.
                maladie_data = {
                    "nom_fr": ligne.get("nom_fr"),
                    "nom_latin": ligne.get("nom_latin", None), # Can be absent from CSV
                    "code_cim_10": ligne.get("code_cim_10"),
                    "description": ligne.get("description", "Description générique. À enrichir via LLM et validation experte."),
                    "gravite_echelle": int(ligne.get("gravite_echelle", 1)), # Default value 1
                    "prevalence": ligne.get("prevalence", "Non spécifié. À enrichir."),
                    "recommandation_triage": ligne.get("recommandation_triage", "consultation_generale"),
                    # Convert CSV strings to Python lists for Pydantic
                    "symptomes_courants_mots_cles": ligne.get("symptomes_courants_mots_cles", "").split(',') if ligne.get("symptomes_courants_mots_cles") else [],
                    "causes_mots_cles": ligne.get("causes_mots_cles", "").split(',') if ligne.get("causes_mots_cles") else [],
                    "facteurs_risque_mots_cles": ligne.get("facteurs_risque_mots_cles", "").split(',') if ligne.get("facteurs_risque_mots_cles") else []
                }
                # Validate that mandatory fields are present
                if not maladie_data["nom_fr"] or not maladie_data["code_cim_10"]:
                    logger.warning(f"Ligne de maladie ignorée (champs obligatoires manquants): {ligne}")
                    continue
                maladies_a_inserer.append(maladie_data)
    except FileNotFoundError:
        logger.error(f"Erreur: Le fichier CSV '{chemin_fichier_csv}' pour les maladies n'a pas été trouvé.")
        return 0 # Returns 0 in case of error
    except Exception as e:
        logger.error(f"Erreur lors de la lecture du fichier CSV des maladies: {e}")
        return 0 # Returns 0 in case of error

    conn = None
    try:
        creer_pool_connexions()
        conn = get_db_connection()
        if conn.is_connected():
            logger.info(f"\n--- Début du peuplement de la table 'maladies' depuis '{chemin_fichier_csv}' ---")
            for i, maladie_data in enumerate(maladies_a_inserer):
                try:
                    maladie_creer = MaladieCreer(**maladie_data)
                    maladie_inseree = crud.creer_maladie(conn, maladie_creer)
                    if maladie_inseree: # Check if insertion occurred (no duplicate)
                        logger.info(f"[{i+1}/{len(maladies_a_inserer)}] Maladie insérée: '{maladie_inseree.nom_fr}' (ID: {maladie_inseree.id})")
                        inserted_count += 1
                    else:
                        # Ce message apparaîtra si la maladie existe déjà
                        logger.warning(f"Maladie '{maladie_data.get('nom_fr', 'N/A')}' (Code CIM: {maladie_data.get('code_cim_10', 'N/A')}) déjà existante. Ignorée.")
                except ValueError as ve:
                    logger.error(f"Erreur de validation/insertion pour la maladie '{maladie_data.get('nom_fr', 'N/A')}': {ve}")
                except Exception as e: # Catch other exceptions not handled by IntegrityError in crud.py
                    logger.error(f"Erreur inattendue lors de l'insertion de la maladie '{maladie_data.get('nom_fr', 'N/A')}': {e}")
            logger.info("--- Peuplement de la table 'maladies' terminé ---")
        else:
            logger.error("Impossible d'établir une connexion à la base de données pour le peuplement des maladies.")
    except Exception as e:
        logger.critical(f"Erreur critique lors du peuplement initial des maladies : {e}")
    finally:
        if conn:
            conn.close()
    return inserted_count


def peupler_symptomes_depuis_csv(chemin_fichier_csv: str) -> int:
    """
    Reads symptom data from a CSV file and inserts it into the database.
    This CSV is intended to be populated with data from reliable sources like SNOMED CT or validated lists.

    Returns:
        int: The number of new symptoms inserted.
    """
    symptomes_a_inserer = []
    inserted_count = 0
    try:
        with open(chemin_fichier_csv, mode='r', encoding='utf-8') as fichier_csv:
            lecteur_csv = csv.DictReader(fichier_csv)
            for ligne in lecteur_csv:
                symptome_data = {
                    "nom_fr": ligne.get("nom_fr"),
                    "description": ligne.get("description", None),
                    "type_symptome": ligne.get("type_symptome", "général"),
                    "gravite_echelle_defaut": int(ligne.get("gravite_echelle_defaut", 1)) if ligne.get("gravite_echelle_defaut") else None,
                    "mots_cles_associes": ligne.get("mots_cles_associes", "").split(',') if ligne.get("mots_cles_associes") else []
                }
                if not symptome_data["nom_fr"] or not symptome_data["type_symptome"]:
                    logger.warning(f"Ligne de symptôme ignorée (champs obligatoires manquants): {ligne}")
                    continue
                symptomes_a_inserer.append(symptome_data)
    except FileNotFoundError:
        logger.error(f"Erreur: Le fichier CSV '{chemin_fichier_csv}' pour les symptômes n'a pas été trouvé.")
        return 0 # Returns 0 in case of error
    except Exception as e:
        logger.error(f"Erreur lors de la lecture du fichier CSV des symptômes: {e}")
        return 0 # Returns 0 in case of error

    conn = None
    try:
        creer_pool_connexions()
        conn = get_db_connection()
        if conn.is_connected():
            logger.info(f"\n--- Début du peuplement de la table 'symptomes' depuis '{chemin_fichier_csv}' ---")
            for i, symptome_data in enumerate(symptomes_a_inserer):
                try:
                    symptome_creer = SymptomeCreer(**symptome_data)
                    symptome_insere = crud.creer_symptome(conn, symptome_creer)
                    if symptome_insere: # Check if insertion occurred
                        logger.info(f"[{i+1}/{len(symptomes_a_inserer)}] Symptôme inséré: '{symptome_insere.nom_fr}' (ID: {symptome_insere.id})")
                        inserted_count += 1
                    else:
                        # Ce message apparaîtra si le symptôme existe déjà
                        logger.warning(f"Symptôme '{symptome_data.get('nom_fr', 'N/A')}' déjà existant. Ignoré.")
                except ValueError as ve:
                    logger.error(f"Erreur de validation/insertion pour le symptôme '{symptome_data.get('nom_fr', 'N/A')}': {ve}")
                except Exception as e:
                    logger.error(f"Erreur inattendue lors de l'insertion du symptôme '{symptome_data.get('nom_fr', 'N/A')}': {e}")
            logger.info("--- Peuplement de la table 'symptomes' terminé ---")
        else:
            logger.error("Impossible d'établir une connexion à la base de données pour le peuplement des symptômes.")
    except Exception as e:
        logger.critical(f"Erreur critique lors du peuplement initial des symptômes : {e}")
    finally:
        if conn:
            conn.close()
    return inserted_count


def peupler_liens_maladies_symptomes_initiaux() -> int:
    """
    Crée des liens entre les maladies et les symptômes en se basant sur les mots-clés
    de symptômes associés définis dans le CSV des maladies.
    """
    conn = None
    inserted_count = 0
    try:
        creer_pool_connexions()
        conn = get_db_connection()
        if conn.is_connected():
            logger.info("\n--- Début du peuplement des liens Maladie-Symptôme depuis les CSV ---")

            # Récupérer tous les IDs des maladies et symptômes déjà insérés
            maladies_db = crud.lire_toutes_maladies(conn, limite=5000) # Augmenter la limite si nécessaire
            symptomes_db = crud.lire_tous_symptomes(conn, limite=5000) # Augmenter la limite si nécessaire

            maladie_map = {m.nom_fr: m.id for m in maladies_db}
            symptome_map = {s.nom_fr: s.id for s in symptomes_db}

            # Itérer sur les maladies pour créer les liens dynamiquement
            for maladie in maladies_db:
                if maladie.symptomes_courants_mots_cles:
                    for mot_cle_symptome in maladie.symptomes_courants_mots_cles:
                        # Nettoyer le mot-clé (supprimer les espaces en trop)
                        nom_symptome_nettoye = mot_cle_symptome.strip()
                        
                        symptome_id = symptome_map.get(nom_symptome_nettoye)

                        if symptome_id is None:
                            logger.warning(f"Symptôme '{nom_symptome_nettoye}' (mentionné dans les mots-clés de '{maladie.nom_fr}') non trouvé dans la base de données. Lien ignoré.")
                            continue

                        try:
                            # Définir des valeurs par défaut pour frequence et importance_diagnostique
                            # car elles ne sont pas spécifiées dans les mots-clés du CSV
                            lien_creer = MaladieSymptomeLienCreer(
                                id_maladie=maladie.id,
                                id_symptome=symptome_id,
                                frequence="commun", # Valeur par défaut
                                importance_diagnostique="moyenne" # Valeur par défaut
                            )
                            lien_insere = crud.creer_lien_maladie_symptome(conn, lien_creer)
                            if lien_insere:
                                logger.info(f"Lien créé: {maladie.nom_fr} <-> {nom_symptome_nettoye}")
                                inserted_count += 1
                            else:
                                # Ce message apparaîtra si le lien existe déjà
                                logger.warning(f"Lien entre '{maladie.nom_fr}' et '{nom_symptome_nettoye}' déjà existant. Ignoré.")
                        except ValueError as ve:
                            logger.error(f"Erreur de validation/insertion pour le lien {maladie.nom_fr} <-> {nom_symptome_nettoye}: {ve}")
                        except Exception as e:
                            logger.error(f"Erreur inattendue lors de la création du lien {maladie.nom_fr} <-> {nom_symptome_nettoye}: {e}")

            logger.info("--- Peuplement des liens Maladie-Symptôme terminé ---")
        else:
            logger.error("Impossible d'établir une connexion à la base de données pour le peuplement des liens.")
    except Exception as e:
        logger.critical(f"Erreur critique lors du peuplement initial des liens : {e}")
    finally:
        if conn:
            conn.close()
    return inserted_count


# --- Main population function ---
def peupler_donnees_initiales_principale():
    """
    Orchestrates the population of all initial database tables.
    """
    configurer_logger(parametres.log_level, parametres.log_file_path)
    logger.info("Début du script de peuplement initial des données.")

    # Étape 1 : Peupler les maladies depuis le fichier CSV
    chemin_csv_maladies = os.path.join(os.path.dirname(__file__), '..', 'app', 'donnees_sources', 'cim_10_maladies.csv')
    maladies_ajoutees = peupler_maladies_depuis_csv(chemin_csv_maladies)
    logger.info(f"Total de {maladies_ajoutees} maladies ajoutées/mises à jour.")


    # Étape 2 : Peupler les symptômes depuis le fichier CSV
    chemin_csv_symptomes = os.path.join(os.path.dirname(__file__), '..', 'app', 'donnees_sources', 'symptomes_courants.csv')
    symptomes_ajoutes = peupler_symptomes_depuis_csv(chemin_csv_symptomes)
    logger.info(f"Total de {symptomes_ajoutes} symptômes ajoutés/mis à jour.")

    # Étape 3 : Peupler les liens Maladie-Symptôme
    liens_ajoutes = peupler_liens_maladies_symptomes_initiaux()
    logger.info(f"Total de {liens_ajoutes} liens Maladie-Symptôme ajoutés.")


    logger.info("Script de peuplement initial des données terminé.")


if __name__ == "__main__":
    peupler_donnees_initiales_principale()
