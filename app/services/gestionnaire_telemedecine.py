# app/services/gestionnaire_telemedecine.py
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import HTTPException, status

# Import des modèles de données
from app.base_de_donnees.modeles import (
    TeleconsultationSessionCreer, TeleconsultationSessionEnDB,
    AppointmentEnDB # Pour vérifier l'existence du rendez-vous lié
)
# Import des fonctions CRUD
from app.base_de_donnees import crud
# Import de la connexion à la base de données
from app.base_de_donnees.connexion import get_db_connection

# Import des services dépendants (pour l'injection)
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

class GestionnaireTelemedecine:
    """
    Gère toutes les opérations et la logique métier relatives aux sessions de téléconsultation,
    y compris la création, la mise à jour (avec transcription et résumé IA) et la récupération.
    """

    def __init__(
        self,
        integrateur_llm: IntegrateurLLM,
        gestionnaire_contexte: GestionnaireContexte
    ):
        self.integrateur_llm = integrateur_llm
        self.gestionnaire_contexte = gestionnaire_contexte
        logger.info("GestionnaireTelemedecine initialisé.")

    async def creer_session_teleconsultation(self, session_data: TeleconsultationSessionCreer) -> Optional[TeleconsultationSessionEnDB]:
        """Crée une nouvelle session de téléconsultation dans la base de données."""
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier que le rendez-vous associé existe
            appointment = crud.lire_appointment_par_id(conn, session_data.appointment_id)
            if not appointment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Rendez-vous associé non trouvé."
                )
            
            # Vérifier qu'il n'existe pas déjà une session pour ce rendez-vous
            existing_session = crud.lire_teleconsultation_sessions_par_appointment(conn, session_data.appointment_id)
            if existing_session:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Une session de téléconsultation existe déjà pour ce rendez-vous."
                )

            new_session = crud.creer_teleconsultation_session(conn, session_data)
            if new_session:
                logger.info(f"Session de téléconsultation créée (ID: {new_session.id}) pour rendez-vous {session_data.appointment_id}.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"teleconsultation_creation_{new_session.id}",
                    role="system",
                    message=f"Session de téléconsultation créée pour rendez-vous {session_data.appointment_id}.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "teleconsultation_created", "session_id": new_session.id, "appointment_id": session_data.appointment_id}
                )
            return new_session
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création de la session de téléconsultation pour rendez-vous {session_data.appointment_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur interne du serveur lors de la création de la session de téléconsultation."
            )
        finally:
            if conn:
                conn.close()

    async def obtenir_session_teleconsultation_par_id(self, session_id: int) -> Optional[TeleconsultationSessionEnDB]:
        """Récupère une session de téléconsultation par son ID."""
        conn = None
        try:
            conn = get_db_connection()
            session = crud.lire_teleconsultation_session_par_id(conn, session_id)
            if not session:
                logger.warning(f"Session de téléconsultation non trouvée pour l'ID: {session_id}.")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session de téléconsultation non trouvée."
                )
            return session
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la session de téléconsultation par ID {session_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur interne du serveur lors de la récupération de la session de téléconsultation."
            )
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_session_teleconsultation(self, session_id: int, update_data: Dict[str, Any]) -> Optional[TeleconsultationSessionEnDB]:
        """Met à jour une session de téléconsultation existante."""
        conn = None
        try:
            conn = get_db_connection()
            existing_session = crud.lire_teleconsultation_session_par_id(conn, session_id)
            if not existing_session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session de téléconsultation non trouvée pour la mise à jour."
                )
            
            # Si la transcription est mise à jour, générer un résumé IA
            if 'transcription_texte' in update_data and update_data['transcription_texte'] != existing_session.transcription_texte:
                transcription = update_data['transcription_texte']
                logger.info(f"Génération du résumé IA pour la session {session_id} suite à la mise à jour de la transcription.")
                # Nous devrons ajouter `generer_resume_teleconsultation` à IntegrateurLLM
                ia_summary = await self.integrateur_llm.generer_resume_teleconsultation(transcription)
                update_data['resume_ia'] = ia_summary
                update_data['horodatage_fin'] = datetime.now() # Marquer la fin de session si transcription finale

            updated_session = crud.mettre_a_jour_teleconsultation_session(conn, session_id, update_data)
            if updated_session:
                logger.info(f"Session de téléconsultation ID {session_id} mise à jour.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"teleconsultation_update_{session_id}",
                    role="system",
                    message=f"Session de téléconsultation ID {session_id} mise à jour.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "teleconsultation_updated", "session_id": session_id, "updated_fields": list(update_data.keys())}
                )
            return updated_session
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la session de téléconsultation ID {session_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur interne du serveur lors de la mise à jour de la session de téléconsultation."
            )
        finally:
            if conn:
                conn.close()

    async def terminer_session_teleconsultation(self, session_id: int, transcription_texte: Optional[str] = None, notes_medecin: Optional[str] = None) -> Optional[TeleconsultationSessionEnDB]:
        """Termine une session de téléconsultation et génère un résumé IA si transcription fournie."""
        update_data = {"statut": "terminee", "horodatage_fin": datetime.now()}
        if transcription_texte:
            update_data["transcription_texte"] = transcription_texte
        if notes_medecin:
            update_data["notes_medecin"] = notes_medecin
        
        return await self.mettre_a_jour_session_teleconsultation(session_id, update_data)

