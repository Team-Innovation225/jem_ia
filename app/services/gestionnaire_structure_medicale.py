# app/services/gestionnaire_structure_medicale.py
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import json

from fastapi import HTTPException, status

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import (
    MedicalStructureCreer, MedicalStructureEnDB, MedicalStructureMettreAJour,
    ResourceCreer, ResourceEnDB, StatisticReportCreer, StatisticReportEnDB
)

# Import pour le typage uniquement
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

class GestionnaireStructureMedicale:
    """
    Gère les opérations métier liées aux structures médicales, y compris la création de profil,
    la mise à jour, et la gestion des ressources et rapports statistiques.
    """
    def __init__(
        self,
        integrateur_llm: IntegrateurLLM,
        gestionnaire_contexte: GestionnaireContexte
    ):
        self.integrateur_llm = integrateur_llm
        self.gestionnaire_contexte = gestionnaire_contexte
        logger.info("GestionnaireStructureMedicale initialisé.")

    async def creer_profil_structure_medicale(self, user_id: int, nom_structure: str, type_structure: str, adresse: str) -> Optional[MedicalStructureEnDB]:
        """
        Crée un profil de structure médicale de base pour un utilisateur donné.
        Cette fonction est appelée lors de l'enregistrement d'un utilisateur avec le rôle 'structure_medicale'.
        """
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si un profil existe déjà pour cet user_id
            existing_structure = crud.lire_structure_medicale_par_user_id(conn, user_id)
            if existing_structure:
                logger.warning(f"Tentative de créer un profil structure médicale pour user_id {user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil de structure médicale existe déjà pour cet utilisateur."
                )

            # Créer un objet MedicalStructureCreer avec des données minimales/par défaut
            structure_data = MedicalStructureCreer(
                user_id=user_id,
                nom_structure=nom_structure,
                type_structure=type_structure,
                adresse=adresse
            )
            
            nouvelle_structure = crud.creer_structure_medicale(conn, structure_data)
            if nouvelle_structure:
                logger.info(f"Profil structure médicale créé avec succès pour user_id: {user_id}, structure_id: {nouvelle_structure.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"structure_creation_{nouvelle_structure.id}",
                    role="system",
                    message=f"Profil structure médicale créé pour user_id {user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "medical_structure_profile_created", "structure_id": nouvelle_structure.id, "user_id": user_id}
                )
            return nouvelle_structure
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil structure médicale pour user_id {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil de structure médicale."
            )
        finally:
            if conn:
                conn.close()

    async def creer_profil_structure_medicale_avec_donnees(self, structure_data: MedicalStructureCreer) -> Optional[MedicalStructureEnDB]:
        """
        Crée un profil de structure médicale avec des données complètes fournies.
        """
        conn = None
        try:
            conn = get_db_connection()
            existing_structure = crud.lire_structure_medicale_par_user_id(conn, structure_data.user_id)
            if existing_structure:
                logger.warning(f"Tentative de créer un profil structure médicale pour user_id {structure_data.user_id} qui existe déjà.")
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Un profil de structure médicale existe déjà pour cet utilisateur."
                )
            
            nouvelle_structure = crud.creer_structure_medicale(conn, structure_data)
            if nouvelle_structure:
                logger.info(f"Profil structure médicale créé avec succès pour user_id: {structure_data.user_id}, structure_id: {nouvelle_structure.id}")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"structure_creation_{nouvelle_structure.id}",
                    role="system",
                    message=f"Profil structure médicale créé avec données complètes pour user_id {structure_data.user_id}",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "medical_structure_profile_created_full", "structure_id": nouvelle_structure.id, "user_id": structure_data.user_id}
                )
            return nouvelle_structure
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du profil structure médicale avec données pour user_id {structure_data.user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Une erreur interne est survenue lors de la création du profil de structure médicale."
            )
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_profil_structure_medicale(self, structure_id: int, structure_update: MedicalStructureMettreAJour) -> Optional[MedicalStructureEnDB]:
        """
        Met à jour un profil de structure médicale existant.
        """
        conn = None
        try:
            conn = get_db_connection()
            structure_exist = crud.lire_structure_medicale_par_id(conn, structure_id)
            if not structure_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil de structure médicale non trouvé.")

            update_data = structure_update.model_dump(exclude_unset=True)
            
            succes = crud.mettre_a_jour_structure_medicale(conn, structure_id, update_data)
            if succes:
                structure_mise_a_jour = crud.lire_structure_medicale_par_id(conn, structure_id)
                logger.info(f"Profil structure médicale ID {structure_id} mis à jour avec succès.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"structure_update_{structure_id}",
                    role="system",
                    message=f"Profil structure médicale ID {structure_id} mis à jour",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "medical_structure_profile_updated", "structure_id": structure_id, "updated_fields": list(update_data.keys())}
                )
                return structure_mise_a_jour
            return None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du profil structure médicale {structure_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def creer_ressource(self, resource_data: ResourceCreer) -> Optional[ResourceEnDB]:
        """
        Crée une nouvelle ressource pour une structure médicale.
        """
        conn = None
        try:
            conn = get_db_connection()
            structure_exist = crud.lire_structure_medicale_par_id(conn, resource_data.structure_id)
            if not structure_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Structure médicale associée non trouvée.")

            nouvelle_ressource = crud.creer_resource(conn, resource_data)
            if nouvelle_ressource:
                logger.info(f"Ressource '{nouvelle_ressource.nom_ressource}' créée pour la structure ID {nouvelle_ressource.structure_id}.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"resource_creation_{nouvelle_ressource.id}",
                    role="system",
                    message=f"Ressource '{nouvelle_ressource.nom_ressource}' créée.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "resource_created", "resource_id": nouvelle_ressource.id, "structure_id": nouvelle_ressource.structure_id}
                )
            return nouvelle_ressource
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création de la ressource: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def generer_rapport_statistique(self, report_data: StatisticReportCreer) -> Optional[StatisticReportEnDB]:
        """
        Génère un rapport statistique pour une structure médicale.
        Le contenu du rapport est généré par l'IA (IntegrateurLLM).
        """
        conn = None
        try:
            conn = get_db_connection()
            structure_exist = crud.lire_structure_medicale_par_id(conn, report_data.structure_id)
            if not structure_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Structure médicale associée non trouvée.")

            # Ici, vous pouvez récupérer des données brutes de la DB pour les passer à l'IA
            # Par exemple, le nombre de rendez-vous terminés, le nombre de patients, etc.
            # Pour l'exemple, nous allons simuler des données ou utiliser un prompt simple.
            
            # Exemple de prompt pour l'IA pour générer le rapport
            prompt_ia = (
                f"Génère un rapport statistique de type '{report_data.type_rapport}' "
                f"pour la période du {report_data.periode_debut} au {report_data.periode_fin}. "
                "Inclure des métriques clés et une analyse concise. "
                "Les données brutes pourraient être: { 'total_patients': 150, 'total_appointments': 200, 'completed_appointments': 180 }."
            )
            
            # Utiliser l'IntegrateurLLM pour générer le contenu du rapport
            # Le contenu généré sera une chaîne JSON ou un texte structuré que nous stockerons.
            generated_report_content = await self.integrateur_llm.generer_rapport_statistique(
                type_rapport=report_data.type_rapport,
                periode_debut=report_data.periode_debut.isoformat(),
                periode_fin=report_data.periode_fin.isoformat(),
                # Passer d'autres données pertinentes ici
                donnees_brutes_exemple={"total_patients": 150, "total_appointments": 200, "completed_appointments": 180}
            )

            # Assurez-vous que generated_report_content est un dictionnaire ou peut être sérialisé en JSON
            if not isinstance(generated_report_content, dict):
                try:
                    generated_report_content = json.loads(generated_report_content)
                except json.JSONDecodeError:
                    logger.error(f"Le rapport généré par l'IA n'est pas un JSON valide: {generated_report_content}")
                    generated_report_content = {"erreur": "Contenu du rapport non JSON valide"}

            report_data.donnees_json = generated_report_content # Assigner le contenu généré par l'IA

            nouveau_rapport = crud.creer_statistic_report(conn, report_data)
            if nouveau_rapport:
                logger.info(f"Rapport statistique '{nouveau_rapport.type_rapport}' généré pour la structure ID {nouveau_rapport.structure_id}.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"stats_report_{nouveau_rapport.id}",
                    role="system",
                    message=f"Rapport statistique '{nouveau_rapport.type_rapport}' généré.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "statistic_report_generated", "report_id": nouveau_rapport.id, "structure_id": nouveau_rapport.structure_id}
                )
            return nouveau_rapport
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport statistique: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

