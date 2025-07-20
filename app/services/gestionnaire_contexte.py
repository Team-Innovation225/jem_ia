import logging
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import ContexteConversationBase, ContexteConversationEnDB, LogConversationCreer, LogConversationEnDB

logger = logging.getLogger(__name__)

class GestionnaireContexte:
    """
    Gère le contexte de conversation et l'historique des interactions avec l'IA.
    Cela inclut le stockage et la récupération des logs de conversation.
    """
    def __init__(self):
        logger.info("GestionnaireContexte initialisé.")

    async def enregistrer_log_conversation(
        self,
        id_session: str,
        role: str, # 'user', 'assistant', 'system'
        message: str,
        type_message: str = 'message_utilisateur', # 'message_utilisateur', 'reponse_ia', 'evenement_systeme'
        donnees_structurees: Optional[Dict[str, Any]] = None
    ) -> LogConversationEnDB:
        """
        Enregistre un log de conversation dans la base de données.
        Crée ou met à jour le contexte de conversation associé.
        """
        conn = None
        try:
            conn = get_db_connection()
            
            # Convertir les données structurées en JSON string si elles existent
            donnees_structurees_json = json.dumps(donnees_structurees) if donnees_structurees else None

            log_creer = LogConversationCreer(
                id_session=id_session,
                role=role,
                message=message, # Utilise le champ 'message' du modèle
                type_message=type_message,
                donnees_structurees=donnees_structurees_json
            )
            
            # Ajouter le log de conversation
            log_enregistre = crud.ajouter_log_conversation(conn, log_creer)
            logger.debug(f"Log de conversation enregistré pour session {id_session}, rôle {role}.")

            # Mettre à jour le contexte de conversation (historique JSON)
            # Récupérer l'historique actuel pour cette session
            historique_complet = await self.obtenir_historique_conversation(id_session)
            # Construire un historique simplifié pour le stockage dans le contexte
            # Limiter la taille de l'historique pour éviter des champs trop grands
            historique_pour_contexte = []
            for entry in historique_complet[-10:]: # Garder les 10 derniers messages
                historique_pour_contexte.append({
                    "role": entry.role,
                    "message": entry.message # Utilise le champ 'message' du modèle LogConversationEnDB
                })
            
            contexte_json = json.dumps(historique_pour_contexte, ensure_ascii=False)

            contexte_creer_ou_maj = ContexteConversationBase(
                id_session=id_session,
                historique_json=contexte_json
            )
            crud.creer_ou_mettre_a_jour_contexte_conversation(conn, contexte_creer_ou_maj)
            logger.debug(f"Contexte de conversation mis à jour pour session {id_session}.")

            return log_enregistre
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement du log de conversation ou de la mise à jour du contexte: {e}", exc_info=True)
            raise
        finally:
            if conn:
                conn.close()

    async def obtenir_historique_conversation(self, id_session: str) -> List[LogConversationEnDB]:
        """
        Récupère l'historique complet des logs de conversation pour une session donnée.
        """
        conn = None
        try:
            conn = get_db_connection()
            logs = crud.lire_logs_conversation_par_session_id(conn, id_session)
            logger.debug(f"Historique de conversation récupéré pour session {id_session}: {len(logs)} entrées.")
            return logs
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'historique de conversation pour session {id_session}: {e}", exc_info=True)
            raise
        finally:
            if conn:
                conn.close()

    async def obtenir_contexte_pour_ia(self, id_session: str) -> List[Dict[str, str]]:
        """
        Récupère l'historique de conversation formaté pour être utilisé par le LLM.
        """
        conn = None
        try:
            conn = get_db_connection()
            contexte_db = crud.lire_contexte_conversation_par_session_id(conn, id_session)
            if contexte_db and contexte_db.historique_json:
                historique_llm = json.loads(contexte_db.historique_json)
                logger.debug(f"Contexte pour IA récupéré pour session {id_session}: {len(historique_llm)} messages.")
                return historique_llm
            logger.debug(f"Aucun contexte pour IA trouvé pour session {id_session}.")
            return []
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du contexte pour IA pour session {id_session}: {e}", exc_info=True)
            raise
        finally:
            if conn:
                conn.close()

    async def obtenir_reponse_ia(self, id_session: str, message_utilisateur: str, user_id: int, user_role: str) -> str:
        """
        Simule l'obtention d'une réponse de l'IA.
        Dans une implémentation réelle, cela appellerait un service LLM.
        """
        # Ici, vous intégreriez la logique d'appel à votre LLM (par exemple, Gemini)
        # Pour l'instant, c'est une réponse simulée.
        logger.info(f"Simulating AI response for session {id_session} from user {user_id} ({user_role}).")
        
        # Exemple de logique simple pour une réponse IA
        if "bonjour" in message_utilisateur.lower():
            reponse = "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
        elif "symptômes" in message_utilisateur.lower() or "malade" in message_utilisateur.lower():
            reponse = "Je peux vous aider à comprendre vos symptômes. Décrivez-les moi."
        elif "rendez-vous" in message_utilisateur.lower():
            reponse = "Je peux vous aider à trouver un médecin ou une structure médicale pour un rendez-vous. Quel est votre besoin ?"
        else:
            reponse = "Je suis un assistant médical virtuel. Je peux vous fournir des informations sur les maladies et les symptômes, ou vous aider à trouver des professionnels de santé. Comment puis-je vous assister ?"
        
        return reponse
