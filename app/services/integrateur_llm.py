# app/services/integrateur_llm.py
import google.generativeai as genai
import logging
import json
from typing import List, Dict, Any, Optional

# Importer les paramètres de configuration pour la clé API
from app.configuration.parametres import parametres

# Configurer le logger pour ce module
logger = logging.getLogger(__name__)

# Configurer l'API Gemini avec la clé API chargée depuis les paramètres
genai.configure(api_key=parametres.GOOGLE_API_KEY)

# --- Configurations de génération pour Gemini ---
# Configuration pour les tâches de compréhension du langage naturel (NLU) et extraction d'entités.
# Une température basse favorise la précision, la fidélité au format et des réponses déterministes.
generation_config_nlu = {
    "temperature": 0.1,
    "top_p": 0.9,
    "top_k": 40,
    "max_output_tokens": 512,
}

# Configuration pour les tâches de génération de texte conversationnel et de résumés/rapports.
# Une température modérée permet des réponses plus naturelles et fluides, avec une certaine créativité contrôlée.
# Max output tokens augmenté pour les rapports plus longs.
generation_config_chat_and_reports = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048, # Augmenté pour les rapports et plannings potentiellement plus longs
}

# Paramètres de sécurité pour bloquer les contenus potentiellement inappropriés ou dangereux.
# Crucial pour une application médicale.
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# Modèle Gemini pour la compréhension du langage naturel et l'extraction d'entités.
model_nlu = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config_nlu,
    safety_settings=safety_settings
)

# Modèle Gemini pour la génération de texte conversationnel, rapports et résumés.
model_chat_and_reports = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config_chat_and_reports,
    safety_settings=safety_settings
)

class IntegrateurLLM:
    """
    Service d'intégration avec les Grands Modèles de Langage (LLM) comme Gemini.
    Responsable de la compréhension du langage naturel, de l'extraction d'entités
    et de la génération de réponses conversationnelles et de rapports/résumés spécialisés.
    """

    def __init__(self):
        logger.info("Intégrateur LLM initialisé avec Gemini 2.0 Flash pour NLU, Chat et Rapports.")

    async def comprendre_intention_et_extraire_entites(self, texte_utilisateur: str) -> Dict[str, Any]:
        """
        Analyse le texte de l'utilisateur pour comprendre son intention principale
        et extraire toutes les entités médicales pertinentes.
        La réponse est structurée en JSON pour une analyse facile.
        """
        safe_texte_utilisateur = json.dumps(texte_utilisateur, ensure_ascii=False)

        prompt = f"""
        En tant qu'assistant médical IA, votre tâche est d'analyser le texte suivant de l'utilisateur.
        Identifiez l'intention principale de l'utilisateur et extrayez toutes les entités médicales pertinentes.

        Entités à extraire (si présentes):
        - 'symptomes': Liste de symptômes décrits par l'utilisateur (ex: "fièvre", "toux sèche", "mal de tête").
        - 'maladies_mentionnees': Liste de maladies explicitement mentionnées par l'utilisateur (ex: "grippe", "paludisme").
        - 'duree': Durée des symptômes (ex: "3 jours", "une semaine").
        - 'localisation_douleur': Où la douleur est ressentie (ex: "abdomen", "poitrine").
        - 'gravite_subjective': Description subjective de la gravité par l'utilisateur (ex: "forte", "légère", "insupportable").
        - 'facteurs_aggravants': Ce qui rend les symptômes pires.
        - 'facteurs_attenuants': Ce qui soulage les symptômes.
        - 'antecedents_medicaux': Conditions médicales passées ou existantes de l'utilisateur.
        - 'medicaments_actuels': Médicaments que l'utilisateur prend actuellement.
        - 'age': Âge de l'utilisateur (si mentionné).
        - 'sexe': Sexe de l'utilisateur (si mentionné).
        - 'objectif_sante': Objectif de santé exprimé (ex: "perdre du poids", "améliorer le sommeil").

        Intentions possibles:
        - 'diagnostic_symptomes': L'utilisateur décrit des symptômes pour obtenir une orientation ou un diagnostic.
        - 'information_maladie': L'utilisateur demande des informations sur une maladie spécifique.
        - 'information_symptome': L'utilisateur demande des informations sur un symptôme spécifique.
        - 'demande_generale_sante': Question générale liée à la santé mais non diagnostique (ex: "comment prévenir la grippe?").
        - 'demande_planning_sante': L'utilisateur demande un planning ou des conseils pour un objectif de santé.
        - 'salutation': L'utilisateur salue l'IA.
        - 'remerciement': L'utilisateur remercie l'IA.
        - 'autre_conversation': L'utilisateur engage une conversation générale, sans intention médicale claire.
        - 'non_pertinent': Le texte n'a aucun rapport avec la santé ou l'assistance médicale.

        La réponse doit être un objet JSON valide. Si une entité n'est pas présente, omettez-la ou mettez une liste vide/null.
        Assurez-vous que le JSON est propre, sans texte additionnel ni backticks (```json).

        Exemples de format JSON:
        - {{"intention": "diagnostic_symptomes", "symptomes": ["fièvre", "maux de tête"], "duree": "2 jours"}}
        - {{"intention": "information_maladie", "maladies_mentionnees": ["paludisme"]}}
        - {{"intention": "salutation"}}
        - {{"intention": "demande_planning_sante", "objectif_sante": "améliorer mon sommeil"}}

        Texte de l'utilisateur: {safe_texte_utilisateur}
        Réponse JSON:
        """

        response_text = ""
        try:
            response = await model_nlu.generate_content_async(prompt)
            response_text = response.text.strip()
            
            # Amélioration de l'extraction JSON: recherche des délimiteurs { et }
            json_start = response_text.find('{')
            json_end = response_text.rfind('}')

            if json_start != -1 and json_end != -1 and json_end > json_start:
                clean_response_text = response_text[json_start : json_end + 1]
            else:
                # Fallback pour les cas où le LLM ajoute des backticks
                if response_text.startswith("```json"):
                    clean_response_text = response_text[len("```json"):].strip()
                elif response_text.startswith("```"):
                    clean_response_text = response_text[len("```"):].strip()
                else:
                    clean_response_text = response_text

                if clean_response_text.endswith("```"):
                    clean_response_text = clean_response_text[:-len("```")].strip()
                
                if not clean_response_text:
                    raise ValueError("La réponse du LLM est vide ou ne contient pas de JSON valide.")

            resultat_parse = json.loads(clean_response_text)
            logger.info(f"Analyse LLM (NLU) réussie: {json.dumps(resultat_parse, ensure_ascii=False)}")
            return resultat_parse
        except json.JSONDecodeError as e:
            logger.error(f"Erreur de décodage JSON de la réponse LLM (NLU): {e}. Réponse brute: {response_text}", exc_info=True)
            return {"intention": "autre_conversation", "message_original": texte_utilisateur, "symptomes": []}
        except Exception as e:
            logger.error(f"Erreur lors de l'appel à l'API Gemini (NLU): {e}. Réponse brute: {response_text}", exc_info=True)
            return {"intention": "autre_conversation", "message_original": texte_utilisateur, "symptomes": []}

    async def generer_clarification(self, contexte_actuel: Dict[str, Any], symptomes_identifies: List[str]) -> str:
        """
        Génère une question de clarification pour l'utilisateur basée sur le contexte actuel
        et les symptômes déjà identifiés.
        """
        contexte_actuel_str = json.dumps(contexte_actuel, ensure_ascii=False)

        prompt = f"""
        En tant qu'assistant médical IA, vous avez identifié les symptômes suivants: {', '.join(symptomes_identifies)}.
        Le contexte actuel de la conversation est: {contexte_actuel_str}.

        Formulez une question concise et pertinente pour obtenir plus de détails
        ou clarifier les symptômes de l'utilisateur, en restant amical et professionnel.

        Exemples:
        - "Pouvez-vous me décrire la nature exacte de vos maux de tête ?"
        - "Depuis combien de temps ressentez-vous cette fièvre ?"
        - "La toux est-elle sèche ou grasse ?"
        - "Ressentez-vous d'autres symptômes, même légers ?"

        Question de clarification:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération de clarification par Gemini: {repr(e)}")
            return "Pourriez-vous me donner plus de détails sur vos symptômes ?"

    async def generer_reponse_informative(self, requete_information: str, informations_base_de_connaissances: Optional[str] = None) -> str:
        """
        Génère une réponse informative basée sur une requête et des informations
        optionnelles provenant de la base de connaissances.
        """
        prompt = f"""
        En tant qu'assistant médical IA, répondez à la question suivante de l'utilisateur.
        Si des informations supplémentaires sont fournies par la base de connaissances, utilisez-les pour enrichir votre réponse.
        Restez concis, clair, professionnel et ne donnez pas de conseils médicaux directs.

        Question de l'utilisateur: "{requete_information}"
        Informations de la base de connaissances (si disponibles):
        {informations_base_de_connaissances if informations_base_de_connaissances else "Aucune information spécifique fournie."}

        Réponse:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération de réponse informative par Gemini: {repr(e)}")
            return "Je ne suis pas en mesure de fournir cette information pour le moment. Veuillez consulter un professionnel de la santé."

    async def generer_reponse_conversationnelle(self, intention: str, message_original: str, entites_extraites: Dict[str, Any]) -> str:
        """
        Génère une réponse conversationnelle amicale et contextuelle.
        Gère les salutations, remerciements, demandes générales ou non pertinentes.
        C'est la première ligne de réponse pour les interactions non diagnostiques directes.
        """
        entites_extraites_str = json.dumps(entites_extraites, ensure_ascii=False)

        prompt_base = f"""
        En tant qu'assistant médical IA, vous interagissez avec un utilisateur.
        Votre objectif est d'être amical, empathique et de guider la conversation vers des sujets de santé,
        tout en restant professionnel et en évitant les conseils médicaux directs.

        L'intention détectée est: '{intention}'.
        Le message original de l'utilisateur était: "{message_original}".
        Les entités extraites sont: {entites_extraites_str}.

        Formulez une réponse appropriée:

        - Si l'intention est 'salutation': Saluez l'utilisateur chaleureusement et invitez-le à exprimer ses préoccupations de santé.
        - Si l'intention est 'remerciement': Remerciez l'utilisateur et proposez de l'aide supplémentaire.
        - Si l'intention est 'demande_generale_sante': Répondez de manière générale sur la santé et invitez à plus de détails ou à des symptômes spécifiques.
        - Si l'intention est 'autre_conversation': Reconnaissez le message et redirigez doucement vers le cadre de l'assistance médicale.
        - Si l'intention est 'non_pertinent': Indiquez poliment que votre domaine d'expertise est la santé et proposez de l'aide sur ce sujet.
        - Si l'intention est 'demande_planning_sante': Indiquez que vous pouvez aider à créer un planning de santé personnalisé et demandez l'objectif précis.

        Réponse de l'IA:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt_base)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération de réponse conversationnelle par Gemini: {repr(e)}")
            return "Bonjour ! Je suis là pour vous aider avec vos questions de santé. Comment puis-je vous assister ?"

    # --- NOUVELLES MÉTHODES POUR LA TÉLÉMÉDECINE ---

    async def generer_resume_sante(self, prompt_utilisateur: str, contexte_sante: Dict[str, Any]) -> str:
        """
        Génère un résumé concis de l'état de santé d'un patient basé sur le contexte fourni.
        Utilisé par GestionnairePatient.
        """
        contexte_sante_str = json.dumps(contexte_sante, ensure_ascii=False)
        prompt = f"""
        En tant qu'assistant médical IA, votre tâche est de générer un résumé concis de l'état de santé d'un patient.
        Le patient a demandé: "{prompt_utilisateur}".
        Voici les données de santé disponibles:
        {contexte_sante_str}

        Veuillez analyser ces informations et fournir un résumé clair et professionnel,
        mettant en évidence les points clés, les tendances et les préoccupations éventuelles.
        N'incluez pas de conseils médicaux directs ni de diagnostic.

        Résumé de l'état de santé:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé de santé par Gemini: {repr(e)}")
            return "Désolé, je n'ai pas pu générer le résumé de l'état de santé pour le moment."

    async def generer_planning_sante(self, prompt_utilisateur: str, contexte_planning: Dict[str, Any]) -> str:
        """
        Génère un planning de santé personnalisé basé sur un objectif et le contexte du patient.
        Utilisé par GestionnairePatient.
        """
        contexte_planning_str = json.dumps(contexte_planning, ensure_ascii=False)
        prompt = f"""
        En tant qu'assistant médical IA, votre tâche est de générer un planning de santé personnalisé.
        Le patient a demandé: "{prompt_utilisateur}".
        Voici les informations pertinentes pour le planning:
        {contexte_planning_str}

        Veuillez proposer un plan d'action structuré et réaliste, incluant des suggestions pour l'alimentation,
        l'exercice, le sommeil, la gestion du stress, etc., en fonction de l'objectif de santé spécifié.
        Le planning doit être facile à comprendre et ne doit pas remplacer un avis médical professionnel.

        Planning de santé personnalisé:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du planning de santé par Gemini: {repr(e)}")
            return "Désolé, je n'ai pas pu générer le planning de santé pour le moment."

    async def generer_rapport_medical(self, prompt_base: str, contexte_rapport: Dict[str, Any]) -> str:
        """
        Génère un rapport médical détaillé au format Markdown.
        Utilisé par GestionnaireMedecin.
        """
        contexte_rapport_str = json.dumps(contexte_rapport, ensure_ascii=False)
        prompt = f"""
        {prompt_base}

        Contexte détaillé pour le rapport:
        {contexte_rapport_str}

        Le rapport doit être complet, structuré, professionnel et au format Markdown.
        Utilisez des titres, des listes et des paragraphes pour une bonne lisibilité.
        N'incluez pas de phrases introductives ou conclusives en dehors du rapport lui-même.

        Rapport Médical:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport médical par Gemini: {repr(e)}")
            return "Désolé, je n'ai pas pu générer le rapport médical pour le moment."

    async def generer_resume_concis(self, texte_long: str) -> str:
        """
        Génère un résumé très concis d'un texte long.
        Utilisé par GestionnaireMedecin.
        """
        prompt = f"""
        Résumez le texte suivant en une ou deux phrases clés.
        Texte:
        {texte_long}

        Résumé:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé concis par Gemini: {repr(e)}")
            return "Impossible de générer un résumé."

    async def generer_resume_teleconsultation(self, transcription_texte: str) -> str:
        """
        Génère un résumé d'une session de téléconsultation à partir de sa transcription.
        Utilisé par GestionnaireTelemedecine.
        """
        prompt = f"""
        En tant qu'assistant médical IA, veuillez générer un résumé concis et professionnel
        de la session de téléconsultation suivante. Mettez en évidence les points clés:
        symptômes principaux, diagnostic ou orientation, traitements/recommandations, et prochaines étapes.

        Transcription de la téléconsultation:
        {transcription_texte}

        Résumé de la téléconsultation:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du résumé de téléconsultation par Gemini: {repr(e)}")
            return "Désolé, je n'ai pas pu générer le résumé de la téléconsultation."

    async def generer_rapport_statistique(self, prompt_llm: str, donnees_brutes: Dict[str, Any]) -> str:
        """
        Génère un rapport statistique basé sur les données brutes et un prompt.
        Utilisé par GestionnaireStructureMedicale.
        """
        donnees_brutes_str = json.dumps(donnees_brutes, ensure_ascii=False)
        prompt = f"""
        En tant qu'analyste IA, votre tâche est de générer un rapport statistique.
        Voici les données brutes à analyser:
        {donnees_brutes_str}

        Instructions spécifiques pour le rapport: {prompt_llm}

        Le rapport doit être clair, concis et mettre en évidence les tendances et les informations clés.
        Utilisez un format lisible.

        Rapport Statistique:
        """
        try:
            response = await model_chat_and_reports.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport statistique par Gemini: {repr(e)}")
            return "Désolé, je n'ai pas pu générer le rapport statistique pour le moment."
