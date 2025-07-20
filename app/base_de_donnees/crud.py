# app/base_de_donnees/crud.py
import sqlite3 # Garder pour compatibilité si des fonctions l'utilisent encore, mais pour MySQL, ce n'est plus pertinent
import json
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from mysql import connector as mysql 

# Import de la nouvelle fonction de connexion MySQL
from app.base_de_donnees.connexion import get_db_connection # <-- MODIFIÉ

from app.base_de_donnees.modeles import (
    UserCreer, UserEnDB, PatientCreer, PatientEnDB, MedecinCreer, MedecinEnDB,
    StructureMedicaleCreer, StructureMedicaleEnDB, ContexteConversationBase,
    ContexteConversationEnDB, LogConversationCreer, LogConversationEnDB,
    RendezVousCreer, RendezVousEnDB
)
# --- Opérations CRUD pour les utilisateurs ---
def creer_user(conn: Any, user: UserCreer) -> Optional[UserEnDB]: # Type conn Any pour flexibilité
    """Crée un nouvel utilisateur dans la base de données."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO users (firebase_uid, email, role)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (user.firebase_uid, user.email, user.role))
        conn.commit()
        user_id = cursor.lastrowid
        if user_id:
            return lire_user_par_id(conn, user_id)
        return None
    except mysql.connector.Error as e: # Utiliser l'erreur spécifique à mysql.connector
        if "Duplicate entry" in str(e) and "for key 'users.email'" in str(e):
            raise ValueError(f"L'email '{user.email}' existe déjà.")
        if "Duplicate entry" in str(e) and "for key 'users.firebase_uid'" in str(e):
            raise ValueError(f"L'ID Firebase '{user.firebase_uid}' est déjà associé à un utilisateur.")
        conn.rollback()
        raise Exception(f"Erreur lors de la création de l'utilisateur: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création de l'utilisateur: {e}")
    finally:
        cursor.close()


def lire_user_par_id(conn: Any, user_id: int) -> Optional[UserEnDB]:
    """Lit un utilisateur par son ID."""
    cursor = conn.cursor(dictionary=True) # Retourne les résultats sous forme de dictionnaires
    query = "SELECT id, firebase_uid, email, role, est_actif, date_creation FROM users WHERE id = %s"
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        # Assurez-vous que date_creation est un objet datetime
        if isinstance(row['date_creation'], bytes): # Parfois, les TIMESTAMPS MySQL sont retournés comme bytes
            row['date_creation'] = row['date_creation'].decode('utf-8')
        if isinstance(row['date_creation'], str):
            row['date_creation'] = datetime.strptime(row['date_creation'], '%Y-%m-%d %H:%M:%S')
        
        return UserEnDB(
            id=row['id'],
            firebase_uid=row['firebase_uid'],
            email=row['email'],
            role=row['role'],
            est_actif=bool(row['est_actif']),
            date_creation=row['date_creation']
        )
    return None

def lire_user_par_email(conn: Any, email: str) -> Optional[UserEnDB]:
    """Lit un utilisateur par son email."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, firebase_uid, email, role, est_actif, date_creation FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        if isinstance(row['date_creation'], bytes):
            row['date_creation'] = row['date_creation'].decode('utf-8')
        if isinstance(row['date_creation'], str):
            row['date_creation'] = datetime.strptime(row['date_creation'], '%Y-%m-%d %H:%M:%S')
        return UserEnDB(
            id=row['id'],
            firebase_uid=row['firebase_uid'],
            email=row['email'],
            role=row['role'],
            est_actif=bool(row['est_actif']),
            date_creation=row['date_creation']
        )
    return None

def lire_user_par_firebase_uid(conn: Any, firebase_uid: str) -> Optional[UserEnDB]:
    """Lit un utilisateur par son Firebase UID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, firebase_uid, email, role, est_actif, date_creation FROM users WHERE firebase_uid = %s"
    cursor.execute(query, (firebase_uid,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        if isinstance(row['date_creation'], bytes):
            row['date_creation'] = row['date_creation'].decode('utf-8')
        if isinstance(row['date_creation'], str):
            row['date_creation'] = datetime.strptime(row['date_creation'], '%Y-%m-%d %H:%M:%S')
        return UserEnDB(
            id=row['id'],
            firebase_uid=row['firebase_uid'],
            email=row['email'],
            role=row['role'],
            est_actif=bool(row['est_actif']),
            date_creation=row['date_creation']
        )
    return None

def mettre_a_jour_user(conn: Any, user_id: int, updates: Dict[str, Any]) -> Optional[UserEnDB]:
    """Met à jour les informations d'un utilisateur."""
    cursor = conn.cursor()
    try:
        set_clauses = []
        values = []
        for key, value in updates.items():
            if key in ["date_creation", "firebase_uid", "email", "id"]: # Ces champs ne devraient pas être mis à jour ici
                continue
            if key == "est_actif":
                values.append(int(value)) # Convertir bool en int pour MySQL BOOLEAN
            else:
                values.append(value)
            set_clauses.append(f"{key} = %s")

        if not set_clauses:
            return lire_user_par_id(conn, user_id)

        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(user_id)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return lire_user_par_id(conn, user_id)
    except mysql.connector.Error as e:
        conn.rollback()
        if "Duplicate entry" in str(e) and "for key 'users.email'" in str(e):
            raise ValueError(f"L'email existe déjà.")
        raise Exception(f"Erreur lors de la mise à jour de l'utilisateur {user_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la mise à jour de l'utilisateur {user_id}: {e}")
    finally:
        cursor.close()

def supprimer_user(conn: Any, user_id: int) -> bool:
    """Supprime un utilisateur par son ID."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression de l'utilisateur {user_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression de l'utilisateur {user_id}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les patients ---
def creer_patient(conn: Any, patient: PatientCreer) -> Optional[PatientEnDB]:
    """Crée un nouveau profil patient."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO patients (user_id, nom, prenom, date_naissance, genre, adresse, telephone)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            query,
            (patient.user_id, patient.nom, patient.prenom, patient.date_naissance, patient.genre, patient.adresse, patient.telephone)
        )
        conn.commit()
        patient_id = cursor.lastrowid
        if patient_id:
            return lire_patient_par_id(conn, patient_id)
        return None
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la création du patient: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création du patient: {e}")
    finally:
        cursor.close()

def lire_patient_par_id(conn: Any, patient_id: int) -> Optional[PatientEnDB]:
    """Lit un profil patient par son ID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom, prenom, date_naissance, genre, adresse, telephone FROM patients WHERE id = %s"
    cursor.execute(query, (patient_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return PatientEnDB(
            id=row['id'], user_id=row['user_id'], nom=row['nom'], prenom=row['prenom'], date_naissance=row['date_naissance'],
            genre=row['genre'], adresse=row['adresse'], telephone=row['telephone']
        )
    return None

def lire_patient_par_user_id(conn: Any, user_id: int) -> Optional[PatientEnDB]:
    """Lit un profil patient par l'ID de l'utilisateur associé."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom, prenom, date_naissance, genre, adresse, telephone FROM patients WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return PatientEnDB(
            id=row['id'], user_id=row['user_id'], nom=row['nom'], prenom=row['prenom'], date_naissance=row['date_naissance'],
            genre=row['genre'], adresse=row['adresse'], telephone=row['telephone']
        )
    return None

def mettre_a_jour_patient(conn: Any, patient_id: int, updates: Dict[str, Any]) -> Optional[PatientEnDB]:
    """Met à jour les informations d'un patient."""
    cursor = conn.cursor()
    try:
        set_clauses = []
        values = []
        for key, value in updates.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)

        if not set_clauses:
            return lire_patient_par_id(conn, patient_id)

        query = f"UPDATE patients SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(patient_id)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return lire_patient_par_id(conn, patient_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la mise à jour du patient {patient_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la mise à jour du patient {patient_id}: {e}")
    finally:
        cursor.close()

def supprimer_patient(conn: Any, patient_id: int) -> bool:
    """Supprime un profil patient."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM patients WHERE id = %s"
        cursor.execute(query, (patient_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression du patient {patient_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression du patient {patient_id}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les médecins ---
def creer_medecin(conn: Any, medecin: MedecinCreer) -> Optional[MedecinEnDB]:
    """Crée un nouveau profil médecin."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO medecins (user_id, nom, prenom, specialite, numero_licence, adresse_cabinet, telephone_cabinet)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            query,
            (medecin.user_id, medecin.nom, medecin.prenom, medecin.specialite, medecin.numero_licence, medecin.adresse_cabinet, medecin.telephone_cabinet)
        )
        conn.commit()
        medecin_id = cursor.lastrowid
        if medecin_id:
            return lire_medecin_par_id(conn, medecin_id)
        return None
    except mysql.connector.Error as e:
        conn.rollback()
        if "Duplicate entry" in str(e) and "for key 'medecins.numero_licence'" in str(e):
            raise ValueError(f"Le numéro de licence '{medecin.numero_licence}' existe déjà.")
        raise Exception(f"Erreur lors de la création du médecin: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création du médecin: {e}")
    finally:
        cursor.close()

def lire_medecin_par_id(conn: Any, medecin_id: int) -> Optional[MedecinEnDB]:
    """Lit un profil médecin par son ID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom, prenom, specialite, numero_licence, adresse_cabinet, telephone_cabinet FROM medecins WHERE id = %s"
    cursor.execute(query, (medecin_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return MedecinEnDB(
            id=row['id'], user_id=row['user_id'], nom=row['nom'], prenom=row['prenom'], specialite=row['specialite'],
            numero_licence=row['numero_licence'], adresse_cabinet=row['adresse_cabinet'], telephone_cabinet=row['telephone_cabinet']
        )
    return None

def lire_medecin_par_user_id(conn: Any, user_id: int) -> Optional[MedecinEnDB]:
    """Lit un profil médecin par l'ID de l'utilisateur associé."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom, prenom, specialite, numero_licence, adresse_cabinet, telephone_cabinet FROM medecins WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return MedecinEnDB(
            id=row['id'], user_id=row['user_id'], nom=row['nom'], prenom=row['prenom'], specialite=row['specialite'],
            numero_licence=row['numero_licence'], adresse_cabinet=row['adresse_cabinet'], telephone_cabinet=row['telephone_cabinet']
        )
    return None

def mettre_a_jour_medecin(conn: Any, medecin_id: int, updates: Dict[str, Any]) -> Optional[MedecinEnDB]:
    """Met à jour les informations d'un médecin."""
    cursor = conn.cursor()
    try:
        set_clauses = []
        values = []
        for key, value in updates.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)

        if not set_clauses:
            return lire_medecin_par_id(conn, medecin_id)

        query = f"UPDATE medecins SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(medecin_id)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return lire_medecin_par_id(conn, medecin_id)
    except mysql.connector.Error as e:
        conn.rollback()
        if "Duplicate entry" in str(e) and "for key 'medecins.numero_licence'" in str(e):
            raise ValueError(f"Le numéro de licence existe déjà.")
        raise Exception(f"Erreur lors de la mise à jour du médecin {medecin_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la mise à jour du médecin {medecin_id}: {e}")
    finally:
        cursor.close()

def supprimer_medecin(conn: Any, medecin_id: int) -> bool:
    """Supprime un profil médecin."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM medecins WHERE id = %s"
        cursor.execute(query, (medecin_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression du médecin {medecin_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression du médecin {medecin_id}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les structures médicales ---
def creer_structure_medicale(conn: Any, structure: StructureMedicaleCreer) -> Optional[StructureMedicaleEnDB]:
    """Crée un nouveau profil de structure médicale."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO structures_medicales (user_id, nom_structure, type_structure, adresse, telephone)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(
            query,
            (structure.user_id, structure.nom_structure, structure.type_structure, structure.adresse, structure.telephone)
        )
        conn.commit()
        structure_id = cursor.lastrowid
        if structure_id:
            return lire_structure_medicale_par_id(conn, structure_id)
        return None
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la création de la structure médicale: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création de la structure médicale: {e}")
    finally:
        cursor.close()

def lire_structure_medicale_par_id(conn: Any, structure_id: int) -> Optional[StructureMedicaleEnDB]:
    """Lit un profil de structure médicale par son ID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom_structure, type_structure, adresse, telephone FROM structures_medicales WHERE id = %s"
    cursor.execute(query, (structure_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return StructureMedicaleEnDB(
            id=row['id'], user_id=row['user_id'], nom_structure=row['nom_structure'], type_structure=row['type_structure'],
            adresse=row['adresse'], telephone=row['telephone']
        )
    return None

def lire_structure_medicale_par_user_id(conn: Any, user_id: int) -> Optional[StructureMedicaleEnDB]:
    """Lit un profil de structure médicale par l'ID de l'utilisateur associé."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, user_id, nom_structure, type_structure, adresse, telephone FROM structures_medicales WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return StructureMedicaleEnDB(
            id=row['id'], user_id=row['user_id'], nom_structure=row['nom_structure'], type_structure=row['type_structure'],
            adresse=row['adresse'], telephone=row['telephone']
        )
    return None

def mettre_a_jour_structure_medicale(conn: Any, structure_id: int, updates: Dict[str, Any]) -> Optional[StructureMedicaleEnDB]:
    """Met à jour les informations d'une structure médicale."""
    cursor = conn.cursor()
    try:
        set_clauses = []
        values = []
        for key, value in updates.items():
            set_clauses.append(f"{key} = %s")
            values.append(value)

        if not set_clauses:
            return lire_structure_medicale_par_id(conn, structure_id)

        query = f"UPDATE structures_medicales SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(structure_id)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return lire_structure_medicale_par_id(conn, structure_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la mise à jour de la structure médicale {structure_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la mise à jour de la structure médicale {structure_id}: {e}")
    finally:
        cursor.close()

def supprimer_structure_medicale(conn: Any, structure_id: int) -> bool:
    """Supprime un profil de structure médicale."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM structures_medicales WHERE id = %s"
        cursor.execute(query, (structure_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression de la structure médicale {structure_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression de la structure médicale {structure_id}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les contextes de conversation ---
def creer_ou_mettre_a_jour_contexte_conversation(conn: Any, contexte: ContexteConversationBase) -> ContexteConversationEnDB:
    """Crée ou met à jour un contexte de conversation."""
    cursor = conn.cursor()
    try:
        # MySQL utilise REPLACE INTO ou INSERT ... ON DUPLICATE KEY UPDATE
        # Pour le type JSON, il faut s'assurer que la chaîne JSON est valide.
        query = """
        INSERT INTO contextes_conversation (id_session, historique_json)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE historique_json = VALUES(historique_json), derniere_mise_a_jour = CURRENT_TIMESTAMP
        """
        cursor.execute(query, (contexte.id_session, contexte.historique_json))
        conn.commit()
        return lire_contexte_conversation_par_session_id(conn, contexte.id_session)
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la création/mise à jour du contexte de conversation: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création/mise à jour du contexte de conversation: {e}")
    finally:
        cursor.close()

def lire_contexte_conversation_par_session_id(conn: Any, id_session: str) -> Optional[ContexteConversationEnDB]:
    """Lit un contexte de conversation par son ID de session."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, id_session, historique_json, derniere_mise_a_jour FROM contextes_conversation WHERE id_session = %s"
    cursor.execute(query, (id_session,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        # Gérer la désérialisation du JSON si stocké en TEXT au lieu de JSON natif
        historique_json_data = row['historique_json']
        if isinstance(historique_json_data, bytes):
            historique_json_data = historique_json_data.decode('utf-8')
        
        # Gérer la conversion de la date
        if isinstance(row['derniere_mise_a_jour'], bytes):
            row['derniere_mise_a_jour'] = row['derniere_mise_a_jour'].decode('utf-8')
        if isinstance(row['derniere_mise_a_jour'], str):
            row['derniere_mise_a_jour'] = datetime.strptime(row['derniere_mise_a_jour'], '%Y-%m-%d %H:%M:%S')
        
        return ContexteConversationEnDB(
            id=row['id'],
            id_session=row['id_session'],
            historique_json=historique_json_data,
            derniere_mise_a_jour=row['derniere_mise_a_jour']
        )
    return None

def supprimer_contexte_conversation(conn: Any, id_session: str) -> bool:
    """Supprime un contexte de conversation par son ID de session."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM contextes_conversation WHERE id_session = %s"
        cursor.execute(query, (id_session,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression du contexte de conversation {id_session}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression du contexte de conversation {id_session}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les logs de conversation ---
def ajouter_log_conversation(conn: Any, log: LogConversationCreer) -> LogConversationEnDB:
    """Ajoute un log de conversation."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO logs_conversation (id_session, role, message, type_message, donnees_structurees)
        VALUES (%s, %s, %s, %s, %s)
        """
        # Convertir les données structurées en JSON string si ce n'est pas déjà le cas
        donnees_structurees_json = log.donnees_structurees
        if isinstance(donnees_structurees_json, dict):
            donnees_structurees_json = json.dumps(donnees_structurees_json)

        cursor.execute(
            query,
            (log.id_session, log.role, log.message, log.type_message, donnees_structurees_json)
        )
        conn.commit()
        log_id = cursor.lastrowid
        # Récupérer le log fraîchement créé pour retourner le modèle complet
        return lire_log_conversation_par_id(conn, log_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de l'ajout du log de conversation: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de l'ajout du log de conversation: {e}")
    finally:
        cursor.close()

def lire_log_conversation_par_id(conn: Any, log_id: int) -> Optional[LogConversationEnDB]:
    """Lit un log de conversation par son ID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, id_session, role, message, horodatage, type_message, donnees_structurees FROM logs_conversation WHERE id = %s"
    cursor.execute(query, (log_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        # Gérer la désérialisation du JSON si stocké en TEXT au lieu de JSON natif
        donnees_structurees_data = row['donnees_structurees']
        if isinstance(donnees_structurees_data, bytes):
            donnees_structurees_data = donnees_structurees_data.decode('utf-8')

        # Gérer la conversion de la date
        if isinstance(row['horodatage'], bytes):
            row['horodatage'] = row['horodatage'].decode('utf-8')
        if isinstance(row['horodatage'], str):
            row['horodatage'] = datetime.strptime(row['horodatage'], '%Y-%m-%d %H:%M:%S')

        return LogConversationEnDB(
            id=row['id'],
            id_session=row['id_session'],
            role=row['role'],
            message=row['message'],
            horodatage=row['horodatage'],
            type_message=row['type_message'],
            donnees_structurees=donnees_structurees_data
        )
    return None

def lire_logs_conversation_par_session_id(conn: Any, id_session: str, limit: Optional[int] = None) -> List[LogConversationEnDB]:
    """Lit les logs de conversation pour un ID de session donné, avec une limite optionnelle."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, id_session, role, message, horodatage, type_message, donnees_structurees FROM logs_conversation WHERE id_session = %s ORDER BY horodatage ASC"
    params = (id_session,)
    if limit is not None:
        query += " LIMIT %s"
        params += (limit,)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    
    results = []
    for row in rows:
        # Gérer la désérialisation du JSON
        donnees_structurees_data = row['donnees_structurees']
        if isinstance(donnees_structurees_data, bytes):
            donnees_structurees_data = donnees_structurees_data.decode('utf-8')
        
        # Gérer la conversion de la date
        if isinstance(row['horodatage'], bytes):
            row['horodatage'] = row['horodatage'].decode('utf-8')
        if isinstance(row['horodatage'], str):
            row['horodatage'] = datetime.strptime(row['horodatage'], '%Y-%m-%d %H:%M:%S')

        results.append(
            LogConversationEnDB(
                id=row['id'],
                id_session=row['id_session'],
                role=row['role'],
                message=row['message'],
                horodatage=row['horodatage'],
                type_message=row['type_message'],
                donnees_structurees=donnees_structurees_data
            )
        )
    return results

def supprimer_logs_conversation_par_session_id(conn: Any, id_session: str) -> bool:
    """Supprime tous les logs de conversation pour un ID de session donné."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM logs_conversation WHERE id_session = %s"
        cursor.execute(query, (id_session,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression des logs de conversation pour la session {id_session}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression des logs de conversation pour la session {id_session}: {e}")
    finally:
        cursor.close()

# --- Opérations CRUD pour les rendez-vous ---
def creer_rendez_vous(conn: Any, rdv: RendezVousCreer) -> Optional[RendezVousEnDB]:
    """Crée un nouveau rendez-vous."""
    cursor = conn.cursor()
    try:
        query = """
        INSERT INTO rendez_vous (patient_id, medecin_id, structure_id, date_heure, motif, statut)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            query,
            (rdv.patient_id, rdv.medecin_id, rdv.structure_id, rdv.date_heure.strftime('%Y-%m-%d %H:%M:%S'), rdv.motif, rdv.statut)
        )
        conn.commit()
        rdv_id = cursor.lastrowid
        if rdv_id:
            return lire_rendez_vous_par_id(conn, rdv_id)
        return None
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la création du rendez-vous: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la création du rendez-vous: {e}")
    finally:
        cursor.close()

def lire_rendez_vous_par_id(conn: Any, rdv_id: int) -> Optional[RendezVousEnDB]:
    """Lit un rendez-vous par son ID."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, patient_id, medecin_id, structure_id, date_heure, motif, statut FROM rendez_vous WHERE id = %s"
    cursor.execute(query, (rdv_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        # Gérer la conversion de la date
        if isinstance(row['date_heure'], bytes):
            row['date_heure'] = row['date_heure'].decode('utf-8')
        if isinstance(row['date_heure'], str):
            row['date_heure'] = datetime.strptime(row['date_heure'], '%Y-%m-%d %H:%M:%S')
        
        return RendezVousEnDB(
            id=row['id'], patient_id=row['patient_id'], medecin_id=row['medecin_id'], structure_id=row['structure_id'],
            date_heure=row['date_heure'],
            motif=row['motif'], statut=row['statut']
        )
    return None

def lire_rendez_vous_par_patient_id(conn: Any, patient_id: int) -> List[RendezVousEnDB]:
    """Lit tous les rendez-vous pour un patient donné."""
    cursor = conn.cursor(dictionary=True)
    query = "SELECT id, patient_id, medecin_id, structure_id, date_heure, motif, statut FROM rendez_vous WHERE patient_id = %s ORDER BY date_heure DESC"
    cursor.execute(query, (patient_id,))
    rows = cursor.fetchall()
    cursor.close()
    
    results = []
    for row in rows:
        # Gérer la conversion de la date
        if isinstance(row['date_heure'], bytes):
            row['date_heure'] = row['date_heure'].decode('utf-8')
        if isinstance(row['date_heure'], str):
            row['date_heure'] = datetime.strptime(row['date_heure'], '%Y-%m-%d %H:%M:%S')
        
        results.append(
            RendezVousEnDB(
                id=row['id'], patient_id=row['patient_id'], medecin_id=row['medecin_id'], structure_id=row['structure_id'],
                date_heure=row['date_heure'],
                motif=row['motif'], statut=row['statut']
            )
        )
    return results

def mettre_a_jour_rendez_vous(conn: Any, rdv_id: int, updates: Dict[str, Any]) -> Optional[RendezVousEnDB]:
    """Met à jour les informations d'un rendez-vous."""
    cursor = conn.cursor()
    try:
        set_clauses = []
        values = []
        for key, value in updates.items():
            if key == "date_heure":
                values.append(value.strftime('%Y-%m-%d %H:%M:%S'))
            else:
                values.append(value)
            set_clauses.append(f"{key} = %s")

        if not set_clauses:
            return lire_rendez_vous_par_id(conn, rdv_id)

        query = f"UPDATE rendez_vous SET {', '.join(set_clauses)} WHERE id = %s"
        values.append(rdv_id)
        
        cursor.execute(query, tuple(values))
        conn.commit()
        return lire_rendez_vous_par_id(conn, rdv_id)
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la mise à jour du rendez-vous {rdv_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la mise à jour du rendez-vous {rdv_id}: {e}")
    finally:
        cursor.close()

def supprimer_rendez_vous(conn: Any, rdv_id: int) -> bool:
    """Supprime un rendez-vous."""
    cursor = conn.cursor()
    try:
        query = "DELETE FROM rendez_vous WHERE id = %s"
        cursor.execute(query, (rdv_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        conn.rollback()
        raise Exception(f"Erreur lors de la suppression du rendez-vous {rdv_id}: {e}")
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erreur inattendue lors de la suppression du rendez-vous {rdv_id}: {e}")
    finally:
        cursor.close()

