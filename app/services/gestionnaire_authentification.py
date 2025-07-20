# app/services/gestionnaire_authentification.py
import logging
import os
from typing import Optional, Dict, Any
from datetime import datetime
import sqlite3

import firebase_admin # <-- NOUVEL IMPORT
from firebase_admin import credentials, auth # <-- NOUVEL IMPORT
from fastapi import HTTPException, status, Request, Security # <-- AJOUTÉ Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # <-- NOUVEL IMPORT

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import UserCreer, UserEnDB, UserRegisterRequest
from app.configuration.parametres import parametres

# Import des gestionnaires de profil pour la création automatique
from app.services.gestionnaire_patient import GestionnairePatient
from app.services.gestionnaire_medecin import GestionnaireMedecin
from app.services.gestionnaire_structure_medicale import GestionnaireStructureMedicale
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

# Initialisation de Firebase Admin SDK
# Cette partie doit être exécutée une seule fois au démarrage de l'application
if not firebase_admin._apps:
    try:
        cred_path = parametres.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
        if not os.path.exists(cred_path):
            raise FileNotFoundError(f"Firebase service account key file not found at: {cred_path}")
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialisé avec succès.")
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation de Firebase Admin SDK: {e}", exc_info=True)
        # Il est critique que Firebase soit initialisé, donc lever une exception si échec
        raise RuntimeError(f"Failed to initialize Firebase Admin SDK: {e}")

# Schéma de sécurité pour l'authentification Bearer (Firebase ID Token)
oauth2_scheme = HTTPBearer()

class GestionnaireAuthentification:
    def __init__(
        self,
        gestionnaire_contexte: GestionnaireContexte,
        gestionnaire_patient: Optional[GestionnairePatient] = None,
        gestionnaire_medecin: Optional[GestionnaireMedecin] = None,
        gestionnaire_structure_medicale: Optional[GestionnaireStructureMedicale] = None
    ):
        self.gestionnaire_contexte = gestionnaire_contexte
        self.gestionnaire_patient = gestionnaire_patient
        self.gestionnaire_medecin = gestionnaire_medecin
        self.gestionnaire_structure_medicale = gestionnaire_structure_medicale
        logger.info("GestionnaireAuthentification initialisé.")

    async def enregistrer_utilisateur_firebase_et_db(self, email: str, password: str, role: str) -> UserEnDB:
        """
        Crée un utilisateur dans Firebase Authentication et dans notre base de données.
        Utilisé pour l'enregistrement Email/Password.
        """
        conn = None
        try:
            conn = get_db_connection()
            logger.info(f"Tentative d'enregistrement Firebase et DB pour l'email: {email} avec le rôle: {role}")

            # 1. Créer l'utilisateur dans Firebase Authentication
            # Firebase gère le hachage du mot de passe
            firebase_user = auth.create_user(email=email, password=password)
            firebase_uid = firebase_user.uid
            logger.info(f"Utilisateur créé dans Firebase avec UID: {firebase_uid}")

            # 2. Vérifier si l'utilisateur existe déjà dans notre DB par email ou firebase_uid
            existing_user_by_email = crud.lire_user_par_email(conn, email)
            if existing_user_by_email:
                if existing_user_by_email.firebase_uid == firebase_uid:
                    logger.warning(f"Utilisateur {email} (UID: {firebase_uid}) existe déjà dans la DB.")
                    return existing_user_by_email # Retourner l'utilisateur existant si déjà synchronisé
                else:
                    # Cas rare: email existe mais avec un UID Firebase différent (conflit)
                    logger.error(f"Conflit d'email: {email} existe avec un UID Firebase différent dans la DB.")
                    # Supprimer l'utilisateur de Firebase pour éviter les orphelins
                    auth.delete_user(firebase_uid)
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="L'email est déjà enregistré avec un autre compte."
                    )
            
            existing_user_by_uid = crud.lire_user_par_firebase_uid(conn, firebase_uid)
            if existing_user_by_uid:
                logger.warning(f"Utilisateur UID {firebase_uid} existe déjà dans la DB (mais pas par email).")
                # Cela ne devrait pas arriver si Firebase est la source unique
                return existing_user_by_uid

            # 3. Créer l'utilisateur dans notre base de données
            user_data_to_create = UserCreer(
                firebase_uid=firebase_uid,
                email=email,
                role=role
            )
            new_user = crud.creer_user(conn, user_data_to_create)

            if not new_user:
                logger.error(f"Échec de la création de l'utilisateur dans la base de données pour {email} (UID: {firebase_uid}).")
                # Supprimer l'utilisateur de Firebase pour éviter les orphelons
                auth.delete_user(firebase_uid)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de la création de l'utilisateur dans la base de données."
                )

            # 4. Créer le profil associé en fonction du rôle
            await self._creer_profil_associe(new_user, conn)
            
            await self.gestionnaire_contexte.ajouter_log_conversation(
                id_session=f"user_registration_{new_user.id}",
                role="system",
                message=f"Nouvel utilisateur enregistré via Firebase: {new_user.email} avec le rôle {new_user.role}",
                type_message="evenement_systeme",
                donnees_structurees={"event": "user_registered_firebase", "user_id": new_user.id, "email": new_user.email, "role": new_user.role, "firebase_uid": new_user.firebase_uid}
            )
            logger.info(f"Utilisateur {email} (UID: {firebase_uid}) enregistré avec succès dans Firebase et DB.")
            return new_user
        except firebase_admin.auth.EmailAlreadyExistsError:
            logger.warning(f"Tentative d'enregistrement: L'email {email} existe déjà dans Firebase.")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="L'email est déjà enregistré."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement de l'utilisateur via Firebase: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Échec de l'enregistrement de l'utilisateur: {e}"
            )
        finally:
            if conn:
                conn.close()

    async def _creer_profil_associe(self, user: UserEnDB, conn: sqlite3.Connection):
        """Fonction interne pour créer le profil associé."""
        if user.role == "patient" and self.gestionnaire_patient:
            logger.info(f"Création du profil patient pour l'utilisateur ID: {user.id}")
            await self.gestionnaire_patient.creer_profil_patient(user.id)
        elif user.role == "medecin" and self.gestionnaire_medecin:
            logger.info(f"Création du profil médecin pour l'utilisateur ID: {user.id}")
            await self.gestionnaire_medecin.creer_profil_medecin(
                user_id=user.id,
                specialite="Généraliste (à spécifier)",
                numero_licence=f"LIC-{user.id}"
            )
        elif user.role == "structure_medicale" and self.gestionnaire_structure_medicale:
            logger.info(f"Création du profil structure médicale pour l'utilisateur ID: {user.id}")
            await self.gestionnaire_structure_medicale.creer_profil_structure_medicale(
                user_id=user.id,
                nom_structure=f"Structure Médicale ID {user.id} (à spécifier)",
                type_structure="Clinique (à spécifier)",
                adresse="Adresse par défaut (à spécifier)"
            )

    async def verify_firebase_id_token(self, id_token: str) -> Dict[str, Any]:
        """
        Vérifie un Firebase ID Token et retourne les informations décodées.
        """
        try:
            # Vérifie le token. Cela lève une erreur si le token est invalide ou expiré.
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Firebase ID Token vérifié pour UID: {decoded_token.get('uid')}")
            return decoded_token
        except Exception as e:
            logger.warning(f"Firebase ID Token invalide: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Firebase ID Token invalide ou expiré: {e}"
            )

    async def get_current_active_user(self, credentials: HTTPAuthorizationCredentials = Security(oauth2_scheme)) -> UserEnDB:
        """
        Dépendance FastAPI pour obtenir l'utilisateur actuellement authentifié
        en vérifiant le Firebase ID Token de l'en-tête Authorization.
        """
        id_token = credentials.credentials # Le token est après "Bearer "
        
        # 1. Vérifier le Firebase ID Token
        decoded_token = await self.verify_firebase_id_token(id_token)
        firebase_uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        email_verified = decoded_token.get("email_verified")

        if not firebase_uid:
            logger.error("Firebase ID Token décodé sans UID.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token d'authentification invalide: UID Firebase manquant."
            )
        if not email:
            logger.error(f"Firebase ID Token décodé pour UID {firebase_uid} sans email.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token d'authentification invalide: Email manquant."
            )
        if not email_verified:
            logger.warning(f"Email non vérifié pour UID {firebase_uid}, Email: {email}.")
            # Vous pouvez choisir de refuser l'accès si l'email n'est pas vérifié
            # raise HTTPException(
            #     status_code=status.HTTP_403_FORBIDDEN,
            #     detail="Votre adresse email n'est pas vérifiée."
            # )

        conn = None
        try:
            conn = get_db_connection()
            # 2. Tenter de trouver l'utilisateur dans notre DB par firebase_uid
            user = crud.lire_user_par_firebase_uid(conn, firebase_uid)

            if user:
                # Si l'utilisateur existe, s'assurer que l'email est à jour
                if user.email != email:
                    crud.mettre_a_jour_user(conn, user.id, {"email": email})
                    user.email = email # Mettre à jour l'objet UserEnDB retourné
                if not user.est_actif:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Compte utilisateur inactif."
                    )
                logger.info(f"Utilisateur {user.email} (UID: {firebase_uid}) authentifié avec succès via Firebase ID Token.")
                return user
            else:
                # Si l'utilisateur n'existe pas dans notre DB, le créer
                logger.info(f"Création d'un nouvel utilisateur dans la DB à partir de Firebase UID: {firebase_uid}, Email: {email}")
                
                # Récupérer le rôle par défaut ou demander à l'utilisateur de le définir
                # Pour la simplicité de cet exemple, nous allons utiliser un rôle par défaut
                # Dans une application réelle, vous pourriez avoir une logique pour attribuer le rôle
                # ou demander à l'utilisateur de le spécifier lors de son premier accès.
                default_role = "patient" # Rôle par défaut pour les nouveaux utilisateurs Firebase

                user_data_to_create = UserCreer(
                    firebase_uid=firebase_uid,
                    email=email,
                    role=default_role
                )
                new_user = crud.creer_user(conn, user_data_to_create)

                if not new_user:
                    logger.error(f"Échec de la création de l'utilisateur DB pour UID: {firebase_uid}.")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Échec de la création de l'utilisateur dans la base de données après authentification Firebase."
                    )
                
                # Créer le profil associé
                await self._creer_profil_associe(new_user, conn)

                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"firebase_sync_{new_user.id}",
                    role="system",
                    message=f"Nouvel utilisateur synchronisé depuis Firebase: {new_user.email} avec le rôle {new_user.role}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "firebase_user_synced", "user_id": new_user.id, "email": new_user.email, "role": new_user.role, "firebase_uid": new_user.firebase_uid}
                )
                logger.info(f"Nouvel utilisateur {email} (UID: {firebase_uid}) créé et synchronisé avec succès dans la DB.")
                return new_user
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la récupération/création de l'utilisateur via Firebase UID: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur interne lors de l'authentification: {e}"
            )
        finally:
            if conn:
                conn.close()

