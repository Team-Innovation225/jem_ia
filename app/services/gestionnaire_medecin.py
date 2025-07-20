# app/services/gestionnaire_medecin.py
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from fastapi import HTTPException, status

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import (
    DoctorCreer, DoctorEnDB, DoctorMettreAJour,
    AppointmentEnDB, MedicalReportEnDB, ConsultationModuleCreer, ConsultationModuleEnDB 
)

# Import pour le typage uniquement
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.moteur_diagnostic import MoteurDiagnostic
from app.services.gestionnaire_connaissances import GestionnaireConnaissances

logger = logging.getLogger(__name__)

class GestionnaireMedecin:
    """
    Gère les opérations métier liées aux médecins, y compris la création de profil,
    la mise à jour, et l'interaction avec d'autres services.
    """
    def __init__(
        self,
        integrateur_llm: IntegrateurLLM,
        gestionnaire_contexte: GestionnaireContexte,
        moteur_diagnostic: MoteurDiagnostic,
        gestionnaire_connaissances: GestionnaireConnaissances
    ):
        self.integrateur_llm = integrateur_llm
        self.gestionnaire_contexte = gestionnaire_contexte
        self.moteur_diagnostic = moteur_diagnostic
        self.gestionnaire_connaissances = gestionnaire_connaissances
        logger.info("GestionnaireMedecin initialisé.")

    async def creer_profil_medecin(self, user_id: int, specialite: str, numero_licence: str) -> Optional[DoctorEnDB]:
        """
        Crée un profil médecin de base pour un utilisateur donné.
        Cette fonction est appelée lors de l'enregistrement d'un utilisateur avec le rôle 'medecin'.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si un profil médecin existe déjà pour cet user_id
            existing_doctor = crud.lire_medecin_par_user_id(conn, user_id)
            if existing_doctor:
                logger.warning(f"Tentative de créer un profil médecin pour user_id {user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil médecin existe déjà pour cet utilisateur."
                )

            # Créer un objet DoctorCreer avec des données minimales/par défaut
            doctor_data = DoctorCreer(
                user_id=user_id,
                specialite=specialite,
                numero_licence=numero_licence
            )
            
            nouveau_medecin = crud.creer_medecin(conn, doctor_data)
            if nouveau_medecin:
                logger.info(f"Profil médecin créé avec succès pour user_id: {user_id}, doctor_id: {nouveau_medecin.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"doctor_creation_{nouveau_medecin.id}",
                    role="system",
                    message=f"Profil médecin créé pour user_id {user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "doctor_profile_created", "doctor_id": nouveau_medecin.id, "user_id": user_id}
                )
            return nouveau_medecin
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil médecin pour user_id {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil médecin."
            )
        finally:
            if conn:
                conn.close()

    async def creer_profil_medecin_avec_donnees(self, doctor_data: DoctorCreer) -> Optional[DoctorEnDB]:
        """
        Crée un profil médecin avec des données complètes fournies.
        """
        conn = None
        try:
            conn = get_db_connection()
            existing_doctor = crud.lire_medecin_par_user_id(conn, doctor_data.user_id)
            if existing_doctor:
                logger.warning(f"Tentative de créer un profil médecin pour user_id {doctor_data.user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil médecin existe déjà pour cet utilisateur."
                )
            
            nouveau_medecin = crud.creer_medecin(conn, doctor_data)
            if nouveau_medecin:
                logger.info(f"Profil médecin créé avec succès pour user_id: {doctor_data.user_id}, doctor_id: {nouveau_medecin.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"doctor_creation_{nouveau_medecin.id}",
                    role="system",
                    message=f"Profil médecin créé avec données complètes pour user_id {doctor_data.user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "doctor_profile_created_full", "doctor_id": nouveau_medecin.id, "user_id": doctor_data.user_id}
                )
            return nouveau_medecin
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil médecin avec données pour user_id {doctor_data.user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil médecin."
            )
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_profil_medecin(self, doctor_id: int, doctor_update: DoctorMettreAJour) -> Optional[DoctorEnDB]:
        """
        Met à jour un profil médecin existant.
        """
        conn = None
        try:
            conn = get_db_connection()
            doctor_exist = crud.lire_medecin_par_id(conn, doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil médecin non trouvé.")

            update_data = doctor_update.model_dump(exclude_unset=True)
            
            succes = crud.mettre_a_jour_medecin(conn, doctor_id, update_data)
            if succes:
                doctor_mis_a_jour = crud.lire_medecin_par_id(conn, doctor_id)
                logger.info(f"Profil médecin ID {doctor_id} mis à jour avec succès.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"doctor_update_{doctor_id}",
                    role="system",
                    message=f"Profil médecin ID {doctor_id} mis à jour",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "doctor_profile_updated", "doctor_id": doctor_id, "updated_fields": list(update_data.keys())}
                )
                return doctor_mis_a_jour
            return None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du profil médecin {doctor_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def lire_rendezvous_medecin(self, doctor_id: int, statut: Optional[str] = None, limite: int = 100, decalage: int = 0) -> List[AppointmentEnDB]:
        """
        Lit les rendez-vous d'un médecin.
        """
        conn = None
        try:
            conn = get_db_connection()
            doctor_exist = crud.lire_medecin_par_id(conn, doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil médecin non trouvé.")
            
            appointments = crud.lire_rendezvous_par_medecin(conn, doctor_id, statut, limite, decalage)
            return appointments
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la lecture des rendez-vous pour le médecin {doctor_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def lire_rapports_medicaux_medecin(self, doctor_id: int, patient_id: Optional[int] = None, limite: int = 100, decalage: int = 0) -> List[MedicalReportEnDB]:
        """
        Lit les rapports médicaux créés par un médecin ou pour un patient spécifique.
        """
        conn = None
        try:
            conn = get_db_connection()
            doctor_exist = crud.lire_medecin_par_id(conn, doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil médecin non trouvé.")
            
            reports = crud.lire_medical_reports_par_medecin(conn, doctor_id, patient_id, limite, decalage)
            return reports
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la lecture des rapports médicaux pour le médecin {doctor_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def creer_module_consultation(self, module_data: ConsultationModuleCreer) -> Optional[ConsultationModuleEnDB]:
        """
        Crée un nouveau module de consultation.
        """
        conn = None
        try:
            conn = get_db_connection()
            doctor_exist = crud.lire_medecin_par_id(conn, module_data.doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Médecin associé non trouvé.")

            nouveau_module = crud.creer_consultation_module(conn, module_data)
            if nouveau_module:
                logger.info(f"Module de consultation '{nouveau_module.titre}' créé par le médecin ID {nouveau_module.doctor_id}.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"module_creation_{nouveau_module.id}",
                    role="system",
                    message=f"Module de consultation '{nouveau_module.titre}' créé.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "consultation_module_created", "module_id": nouveau_module.id, "doctor_id": nouveau_module.doctor_id}
                )
            return nouveau_module
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du module de consultation: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def effectuer_diagnostic_approfondi(self, patient_id: int, symptomes: List[str], contexte_supplementaire: Optional[str] = None) -> Dict[str, Any]:
        """
        Utilise le moteur de diagnostic pour un diagnostic approfondi, potentiellement avec des données patient.
        """
        conn = None
        try:
            conn = get_db_connection()
            patient = crud.lire_patient_par_id(conn, patient_id)
            if not patient:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

            # Récupérer les logs de conversation récents du patient pour le contexte
            logs_conversation = crud.lire_logs_conversation_par_session(conn, f"conversation_{patient_id}", limit=20)
            historique_contexte = [log.message for log in logs_conversation]

            # Ajouter le contexte supplémentaire fourni par le médecin
            if contexte_supplementaire:
                historique_contexte.append(f"Contexte fourni par le médecin: {contexte_supplementaire}")

            # Appeler le moteur de diagnostic
            diagnostic_result = await self.moteur_diagnostic.traiter_demande_utilisateur( # Correction: Utiliser traiter_demande_utilisateur
                id_session=f"diagnostic_medecin_{patient_id}",
                message_utilisateur=" ".join(symptomes) # Convertir la liste de symptômes en une chaîne pour le LLM
            )
            
            # Le moteur de diagnostic enregistre déjà les logs, donc pas besoin de le faire ici
            # await self.gestionnaire_contexte.ajouter_log_conversation(...)
            
            return diagnostic_result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors du diagnostic approfondi pour patient {patient_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne lors du diagnostic approfondi: {e}")
        finally:
            if conn:
                conn.close()

    async def suggerer_maladies_par_symptomes(self, symptomes: List[str]) -> List[Dict[str, Any]]:
        """
        Suggère des maladies potentielles basées sur une liste de symptômes en utilisant le gestionnaire de connaissances.
        """
        try:
            maladies_suggerees = await self.gestionnaire_connaissances.rechercher_maladies_par_symptomes(symptomes)
            logger.info(f"Suggestion de maladies pour symptômes {symptomes}: {len(maladies_suggerees)} trouvées.")
            return maladies_suggerees
        except Exception as e:
            logger.error(f"Erreur lors de la suggestion de maladies par symptômes: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne lors de la suggestion de maladies: {e}")

