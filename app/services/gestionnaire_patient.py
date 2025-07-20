# app/services/gestionnaire_patient.py
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from fastapi import HTTPException, status

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import (
    PatientCreer, PatientEnDB, PatientMettreAJour,
    HealthStatusLogCreer, WearableDataCreer, MedicalReportCreer, HealthStatusLogEnDB, WearableDataEnDB
)

# Import pour le typage uniquement
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.moteur_diagnostic import MoteurDiagnostic

logger = logging.getLogger(__name__)

class GestionnairePatient:
    """
    Gère les opérations métier liées aux patients, y compris la création de profil,
    la mise à jour, et l'interaction avec d'autres services comme l'IA pour le diagnostic.
    """
    def __init__(
        self,
        integrateur_llm: IntegrateurLLM,
        gestionnaire_contexte: GestionnaireContexte,
        moteur_diagnostic: MoteurDiagnostic
    ):
        self.integrateur_llm = integrateur_llm
        self.gestionnaire_contexte = gestionnaire_contexte
        self.moteur_diagnostic = moteur_diagnostic
        logger.info("GestionnairePatient initialisé.")

    async def creer_profil_patient(self, user_id: int) -> Optional[PatientEnDB]:
        """
        Crée un profil patient de base pour un utilisateur donné.
        Cette fonction est appelée lors de l'enregistrement d'un utilisateur avec le rôle 'patient'.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si un profil patient existe déjà pour cet user_id
            existing_patient = crud.lire_patient_par_user_id(conn, user_id)
            if existing_patient:
                logger.warning(f"Tentative de créer un profil patient pour user_id {user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil patient existe déjà pour cet utilisateur."
                )

            # Créer un objet PatientCreer avec des données minimales/par défaut
            # Note: Les champs obligatoires comme date_naissance et sexe doivent être fournis
            # par l'utilisateur lors de l'enregistrement ou via un endpoint de profilage.
            # Pour l'instant, utilisons des valeurs par défaut pour permettre la création initiale.
            patient_data = PatientCreer(
                user_id=user_id,
                date_naissance=date(2000, 1, 1), # Exemple de date par défaut
                sexe="Non spécifié" # Exemple de sexe par défaut
            )
            
            nouveau_patient = crud.creer_patient(conn, patient_data)
            if nouveau_patient:
                logger.info(f"Profil patient créé avec succès pour user_id: {user_id}, patient_id: {nouveau_patient.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"patient_creation_{nouveau_patient.id}",
                    role="system",
                    message=f"Profil patient créé pour user_id {user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "patient_profile_created", "patient_id": nouveau_patient.id, "user_id": user_id}
                )
            return nouveau_patient
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil patient pour user_id {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil patient."
            )
        finally:
            if conn:
                conn.close()

    async def creer_profil_patient_avec_donnees(self, patient_data: PatientCreer) -> Optional[PatientEnDB]:
        """
        Crée un profil patient avec des données complètes fournies.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si un profil patient existe déjà pour cet user_id
            existing_patient = crud.lire_patient_par_user_id(conn, patient_data.user_id)
            if existing_patient:
                logger.warning(f"Tentative de créer un profil patient pour user_id {patient_data.user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil patient existe déjà pour cet utilisateur."
                )
            
            nouveau_patient = crud.creer_patient(conn, patient_data)
            if nouveau_patient:
                logger.info(f"Profil patient créé avec succès pour user_id: {patient_data.user_id}, patient_id: {nouveau_patient.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"patient_creation_{nouveau_patient.id}",
                    role="system",
                    message=f"Profil patient créé avec données complètes pour user_id {patient_data.user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "patient_profile_created_full", "patient_id": nouveau_patient.id, "user_id": patient_data.user_id}
                )
            return nouveau_patient
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil patient avec données pour user_id {patient_data.user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil patient."
            )
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_profil_patient(self, patient_id: int, patient_update: PatientMettreAJour) -> Optional[PatientEnDB]:
        """
        Met à jour un profil patient existant.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si le patient existe
            patient_exist = crud.lire_patient_par_id(conn, patient_id)
            if not patient_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil patient non trouvé.")

            # Convertir le modèle Pydantic en dictionnaire pour la fonction CRUD
            update_data = patient_update.model_dump(exclude_unset=True)
            
            succes = crud.mettre_a_jour_patient(conn, patient_id, update_data)
            if succes:
                patient_mis_a_jour = crud.lire_patient_par_id(conn, patient_id)
                logger.info(f"Profil patient ID {patient_id} mis à jour avec succès.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"patient_update_{patient_id}",
                    role="system",
                    message=f"Profil patient ID {patient_id} mis à jour",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "patient_profile_updated", "patient_id": patient_id, "updated_fields": list(update_data.keys())}
                )
                return patient_mis_a_jour
            return None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du profil patient {patient_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def enregistrer_journal_sante(self, patient_id: int, log_data: HealthStatusLogCreer) -> Optional[HealthStatusLogEnDB]:
        """
        Enregistre un nouveau journal de santé pour un patient.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si le patient existe
            patient_exist = crud.lire_patient_par_id(conn, patient_id)
            if not patient_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")
            
            # Assurez-vous que le patient_id dans log_data correspond à celui de l'URL
            log_data.patient_id = patient_id

            nouveau_log = crud.creer_health_status_log(conn, log_data)
            if nouveau_log:
                logger.info(f"Journal de santé créé pour patient ID {patient_id}, log ID: {nouveau_log.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"health_log_{patient_id}",
                    role="system",
                    message=f"Nouveau journal de santé enregistré pour patient ID {patient_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "health_log_created", "patient_id": patient_id, "log_id": nouveau_log.id}
                )
            return nouveau_log
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement du journal de santé pour patient {patient_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def enregistrer_donnees_wearable(self, patient_id: int, data: WearableDataCreer) -> Optional[WearableDataEnDB]:
        """
        Enregistre de nouvelles données d'appareil connecté pour un patient.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si le patient existe
            patient_exist = crud.lire_patient_par_id(conn, patient_id)
            if not patient_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")
            
            # Assurez-vous que le patient_id dans data correspond à celui de l'URL
            data.patient_id = patient_id

            nouvelles_donnees = crud.creer_wearable_data(conn, data)
            if nouvelles_donnees:
                logger.info(f"Données wearable enregistrées pour patient ID {patient_id}, data ID: {nouvelles_donnees.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"wearable_data_{patient_id}",
                    role="system",
                    message=f"Nouvelles données wearable enregistrées pour patient ID {patient_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "wearable_data_created", "patient_id": patient_id, "data_id": nouvelles_donnees.id, "type": data.type_donnee}
                )
            return nouvelles_donnees
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement des données wearable pour patient {patient_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def lancer_diagnostic_patient(self, patient_id: int, symptomes: List[str]) -> Dict[str, Any]:
        """
        Lance un diagnostic pour un patient donné en utilisant le moteur de diagnostic.
        """
        conn = None
        try:
            conn = get_db_connection()
            patient = crud.lire_patient_par_id(conn, patient_id)
            if not patient:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

            # Récupérer les logs de conversation récents du patient pour le contexte
            logs_conversation = crud.lire_logs_conversation_par_session(conn, f"conversation_{patient_id}", limit=10)
            historique_contexte = [log.message for log in logs_conversation]

            # Appeler le moteur de diagnostic
            diagnostic_result = await self.moteur_diagnostic.traiter_demande_utilisateur( # Correction: Utiliser traiter_demande_utilisateur
                id_session=f"conversation_{patient_id}",
                message_utilisateur=" ".join(symptomes) # Convertir la liste de symptômes en une chaîne pour le LLM
            )
            
            # Le moteur de diagnostic enregistre déjà les logs, donc pas besoin de le faire ici
            # await self.gestionnaire_contexte.ajouter_log_conversation(...)
            
            return diagnostic_result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors du lancement du diagnostic pour patient {patient_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne lors du diagnostic: {e}")
        finally:
            if conn:
                conn.close()

