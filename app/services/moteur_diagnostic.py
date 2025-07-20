# app/services/moteur_diagnostic.py
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
import json
import os # Importation ajoutée pour la gestion des chemins de fichiers

# nos les services
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_connaissances import GestionnaireConnaissances
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.gestionnaire_vocal import GestionnaireVocal

# les modèles de données
from app.base_de_donnees.modeles import MaladieEnDB, SymptomeEnDB, LogConversationEnDB # <-- CORRIGÉ ICI

# Configurer le logger
logger = logging.getLogger(__name__)

class MoteurDiagnostic:
    """
    Le cœur intelligent de l'IA, orchestrant la compréhension, la gestion des connaissances
    et la génération de réponses pour le diagnostic pré-médical et la conversation.
    """

    def __init__(
        self,
        integrateur_llm: IntegrateurLLM,
        gestionnaire_connaissances: GestionnaireConnaissances,
        gestionnaire_contexte: GestionnaireContexte,
        gestionnaire_vocal: GestionnaireVocal
    ):
        # Assigner les instances injectées aux attributs de la classe
        self.llm_integrator = integrateur_llm
        self.knowledge_manager = gestionnaire_connaissances
        self.context_manager = gestionnaire_contexte
        self.vocal_manager = gestionnaire_vocal
        logger.info("Moteur de Diagnostic initialisé.")

    async def traiter_demande_utilisateur(
        self,
        id_session: str,
        message_utilisateur: Optional[str] = None,
        chemin_audio_utilisateur: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Traite une demande utilisateur, de la compréhension à la génération de réponse,
        supportant les entrées texte ou audio.

        Args:
            id_session (str): L'identifiant unique de la session de conversation.
            message_utilisateur (Optional[str]): Le message texte de l'utilisateur.
                                                 Requis si chemin_audio_utilisateur n'est pas fourni.
            chemin_audio_utilisateur (Optional[str]): Le chemin d'accès au fichier audio de l'utilisateur.
                                                      Si fourni, le texte sera transcrit à partir de l'audio.

        Returns:
            Dict[str, Any]: Un dictionnaire contenant la réponse de l'IA (texte et/ou audio) et des métadonnées.
                            Ex: {"reponse_ia": "Bonjour ! Comment puis-je vous aider ?", "intention": "salutation",
                                 "ai_message_db_id": 123, "chemin_audio_reponse_ia": "/chemin/vers/audio.mp3"}
        """
        try:
            logger.debug(f"[{id_session}] Début du traitement de la demande utilisateur.")

            # 1. Traiter l'entrée (texte ou audio)
            if chemin_audio_utilisateur:
                logger.debug(f"[{id_session}] Entrée audio détectée. Transcription en cours pour : {chemin_audio_utilisateur}")
                # Appeler le gestionnaire vocal pour transcrire l'audio en texte
                message_utilisateur = await self.vocal_manager.transcrire_audio_en_texte(chemin_audio_utilisateur)
                if not message_utilisateur:
                    logger.error(f"[{id_session}] La transcription audio a échoué ou n'a produit aucun texte pour : {chemin_audio_utilisateur}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="La transcription audio a échoué ou n'a produit aucun texte. Veuillez réessayer."
                    )
                logger.debug(f"[{id_session}] Audio transcrit en texte: '{message_utilisateur}'")
            elif not message_utilisateur:
                # Si ni message texte ni chemin audio n'est fourni, c'est une erreur
                logger.error(f"[{id_session}] Aucun message utilisateur ou chemin audio fourni.")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Aucun message utilisateur ou chemin audio fourni. Veuillez fournir du texte ou un enregistrement vocal."
                )
            else:
                logger.debug(f"[{id_session}] Entrée texte détectée: '{message_utilisateur}'")


            # 2. Enregistrer le message de l'utilisateur
            await self.context_manager.enregistrer_log_conversation(
                id_session=id_session,
                type_acteur="utilisateur",
                message=message_utilisateur
            )
            logger.debug(f"[{id_session}] Message utilisateur enregistré.")

            # 3. Comprendre l'intention et extraire les entités via le LLM
            logger.debug(f"[{id_session}] Appel à IntegrateurLLM.comprendre_intention_et_extraire_entites...")
            nlu_result = await self.llm_integrator.comprendre_intention_et_extraire_entites(message_utilisateur)

            # S'assurer que nlu_result est un dictionnaire et contient les clés attendues
            if not isinstance(nlu_result, dict):
                logger.error(f"[{id_session}] IntegrateurLLM.comprendre_intention_et_extraire_entites a retourné un type inattendu: {type(nlu_result)}. Attendu: dict.")
                nlu_result = {"intention": "autre_conversation", "message_original": message_utilisateur, "symptomes": []}

            intention = nlu_result.get("intention", "autre_conversation")
            entites_extraites = {k: v for k, v in nlu_result.items() if k != "intention"}
            if "symptomes" not in entites_extraites or not isinstance(entites_extraites["symptomes"], list):
                entites_extraites["symptomes"] = []

            logger.debug(f"[{id_session}] NLU Resultat: Intention='{intention}', Entites={json.dumps(entites_extraites, ensure_ascii=False)}")

            # Enregistrer le résultat de l'analyse NLU
            await self.context_manager.enregistrer_log_conversation(
                id_session=id_session,
                type_acteur="ia_nlu",
                message=f"Intention détectée: {intention}",
                donnees_structurees=nlu_result
            )
            logger.debug(f"[{id_session}] Résultat NLU enregistré.")

            reponse_ia = ""
            recommandation_triage: str = "information_generale"
            ai_message_db_id: Optional[int] = None
            chemin_audio_reponse_ia: Optional[str] = None

            # 4. Orchestrer la réponse en fonction de l'intention
            logger.debug(f"[{id_session}] Orchestration de la réponse pour l'intention: '{intention}'")
            if intention in ["salutation", "remerciement", "autre_conversation", "non_pertinent", "demande_generale_sante"]:
                logger.debug(f"[{id_session}] Intention conversationnelle, appel à generer_reponse_conversationnelle.")
                reponse_ia = await self.llm_integrator.generer_reponse_conversationnelle(
                    intention, message_utilisateur, entites_extraites
                )
                recommandation_triage = "conversation"

            elif intention == "information_maladie":
                logger.debug(f"[{id_session}] Intention: information_maladie.")
                maladies_mentionnees = entites_extraites.get("maladies_mentionnees", [])
                if maladies_mentionnees:
                    maladie_nom = maladies_mentionnees[0]
                    logger.debug(f"[{id_session}] Recherche de détails pour la maladie: '{maladie_nom}'.")
                    maladie_details = await self.knowledge_manager.obtenir_details_maladie(maladie_nom)

                    info_pour_llm = ""
                    if maladie_details:
                        info_pour_llm = (
                            f"Nom: {maladie_details.nom_fr}\n"
                            f"Code CIM-10: {maladie_details.code_cim_10}\n"
                            f"Description: {maladie_details.description}\n"
                            f"Gravité (1-5): {maladie_details.gravite}\n"
                            f"Prévalence: {maladie_details.prevalence}\n"
                            f"Recommandation de triage: {maladie_details.recommandation_triage}\n"
                            f"Symptômes courants: {', '.join(maladie_details.symptomes_courants_mots_cles)}\n"
                            f"Causes: {', '.join(maladie_details.causes_mots_cles)}\n"
                            f"Facteurs de risque: {', '.join(maladie_details.facteurs_risque_mots_cles)}"
                        )
                        recommandation_triage = maladie_details.recommandation_triage
                        logger.debug(f"[{id_session}] Détails maladie trouvés pour '{maladie_nom}'.")
                    else:
                        info_pour_llm = f"Aucune information détaillée trouvée pour '{maladie_nom}'."
                        recommandation_triage = "information_generale"
                        logger.debug(f"[{id_session}] Aucun détail maladie trouvé pour '{maladie_nom}'.")

                    reponse_ia = await self.llm_integrator.generer_reponse_informative(
                        message_utilisateur, info_pour_llm
                    )
                else:
                    reponse_ia = "Je n'ai pas identifié de maladie spécifique dans votre demande. Pourriez-vous préciser ?"
                    recommandation_triage = "information_generale"
                logger.debug(f"[{id_session}] Réponse informative générée pour information_maladie.")

            elif intention == "information_symptome":
                logger.debug(f"[{id_session}] Intention: information_symptome.")
                symptomes_mentionnes = entites_extraites.get("symptomes", [])
                if symptomes_mentionnes:
                    symptome_nom = symptomes_mentionnes[0]
                    logger.debug(f"[{id_session}] Recherche de détails pour le symptôme: '{symptome_nom}'.")
                    symptome_details = await self.knowledge_manager.obtenir_details_symptome(symptome_nom)

                    info_pour_llm = ""
                    if symptome_details:
                        info_pour_llm = (
                            f"Nom: {symptome_details.nom_fr}\n"
                            f"Description: {symptome_details.description}\n"
                            f"Gravité potentielle (1-10): {symptome_details.gravite_potentielle}\n"
                            f"Mots-clés associés: {', '.join(symptome_details.mots_cles_associes)}"
                        )
                        logger.debug(f"[{id_session}] Détails symptôme trouvés pour '{symptome_nom}'.")
                    else:
                        info_pour_llm = f"Aucune information détaillée trouvée pour '{symptome_nom}'."
                        logger.debug(f"[{id_session}] Aucun détail symptôme trouvé pour '{symptome_nom}'.")

                    reponse_ia = await self.llm_integrator.generer_reponse_informative(
                        message_utilisateur, info_pour_llm
                    )
                    recommandation_triage = "information_generale"
                else:
                    reponse_ia = "Je n'ai pas identifié de symptôme spécifique dans votre demande. Pourriez-vous préciser ?"
                    recommandation_triage = "information_generale"
                logger.debug(f"[{id_session}] Réponse informative générée pour information_symptome.")

            elif intention == "diagnostic_symptomes":
                logger.debug(f"[{id_session}] Intention: diagnostic_symptomes.")
                symptomes_identifies = entites_extraites.get("symptomes", [])

                if not symptomes_identifies:
                    logger.debug(f"[{id_session}] Aucun symptôme identifié pour le diagnostic, appel à generer_clarification.")
                    reponse_ia = await self.llm_integrator.generer_clarification(
                        contexte_actuel={"message_utilisateur": message_utilisateur},
                        symptomes_identifies=[]
                    )
                    recommandation_triage = "clarification_necessaire"
                else:
                    logger.debug(f"[{id_session}] Symptômes identifiés: {symptomes_identifies}. Recherche de maladies potentielles.")
                    maladies_pertinentes = await self.knowledge_manager.rechercher_maladies_par_symptomes(symptomes_identifies)

                    if not maladies_pertinentes:
                        logger.debug(f"[{id_session}] Aucune maladie pertinente trouvée pour les symptômes.")
                        reponse_ia = await self.llm_integrator.generer_reponse_informative(
                            f"Je n'ai pas trouvé de maladies courantes correspondant précisément à vos symptômes: {', '.join(symptomes_identifies)}. "
                            "Pourriez-vous me donner plus de détails ou d'autres symptômes ?",
                            None
                        )
                        recommandation_triage = "clarification_necessaire"
                    else:
                        logger.debug(f"[{id_session}] Maladies pertinentes trouvées. Construction de la réponse de diagnostic.")
                        top_maladies_info = []
                        for i, item in enumerate(maladies_pertinentes[:3]):
                            maladie = item["maladie"]
                            confiance = item["confiance"]
                            symptomes_correspondants = item["symptomes_correspondants"]

                            top_maladies_info.append(
                                f"{i+1}. **{maladie.nom_fr}** (Confiance: {confiance:.2f}%) - "
                                f"Symptômes correspondants: {', '.join(symptomes_correspondants)}. "
                                f"Description: {maladie.description[:100]}... "
                                f"Triage suggéré: {maladie.recommandation_triage.replace('_', ' ').capitalize()}."
                            )

                        recommandation_triage = maladies_pertinentes[0]["maladie"].recommandation_triage

                        if maladies_pertinentes[0]["confiance"] < 50.0 and len(symptomes_identifies) < 3:
                            reponse_ia_prefix = "Basé sur les informations que vous m'avez fournies, voici une première orientation. "
                            reponse_ia_suffix = await self.llm_integrator.generer_clarification(
                                contexte_actuel={"symptomes": symptomes_identifies},
                                symptomes_identifies=symptomes_identifies
                            )
                            recommandation_triage = "clarification_necessaire"
                        elif len(maladies_pertinentes) > 1 and (maladies_pertinentes[0]["confiance"] - maladies_pertinentes[1]["confiance"]) < 15.0:
                            reponse_ia_prefix = "Basé sur les informations que vous m'avez fournies, plusieurs pistes sont possibles. "
                            reponse_ia_suffix = await self.llm_integrator.generer_clarification(
                                contexte_actuel={"symptomes": symptomes_identifies},
                                symptomes_identifies=symptomes_identifies
                            )
                            recommandation_triage = "clarification_necessaire"
                        else:
                            reponse_ia_prefix = "Basé sur les symptômes que vous avez décrits, voici une orientation possible. "
                            reponse_ia_suffix = "N'oubliez pas que seul un professionnel de santé peut poser un diagnostic définitif."

                        info_diagnostic_pour_llm = "\n".join(top_maladies_info)

                        reponse_ia = await self.llm_integrator.generer_reponse_informative(
                            f"{reponse_ia_prefix}\n\n{info_diagnostic_pour_llm}\n\n{reponse_ia_suffix}",
                            None
                        )
                logger.debug(f"[{id_session}] Réponse de diagnostic générée.")

            else:
                logger.debug(f"[{id_session}] Intention non gérée ou fallback: '{intention}'. Appel à generer_reponse_conversationnelle.")
                reponse_ia = await self.llm_integrator.generer_reponse_conversationnelle(
                    "autre_conversation", message_utilisateur, entites_extraites
                )
                recommandation_triage = "conversation"

            # 5. Générer l'audio de la réponse de l'IA
            nom_fichier_audio_reponse = f"reponse_ia_{id_session}_{os.urandom(4).hex()}.mp3"
            repertoire_audio_reponses = "audio_reponses"
            os.makedirs(repertoire_audio_reponses, exist_ok=True)
            chemin_audio_reponse_ia = os.path.join(repertoire_audio_reponses, nom_fichier_audio_reponse)

            chemin_audio_reponse_ia = await self.vocal_manager.generer_audio_depuis_texte(
                reponse_ia, chemin_audio_reponse_ia
            )
            if not chemin_audio_reponse_ia:
                logger.warning(f"[{id_session}] La génération audio de la réponse IA a échoué.")
                pass

            logger.debug(f"[{id_session}] Audio de la réponse IA généré: {chemin_audio_reponse_ia}")

            # 6. Enregistrer la réponse de l'IA et récupérer son ID de DB
            log_ia_cree: Optional[LogConversationEnDB] = await self.context_manager.enregistrer_log_conversation( # <-- CORRIGÉ ICI
                id_session=id_session,
                type_acteur="ia",
                message=reponse_ia,
                donnees_structurees={"intention_reponse": intention, "triage_suggere": recommandation_triage, "chemin_audio": chemin_audio_reponse_ia}
            )
            ai_message_db_id = log_ia_cree.id if log_ia_cree else None
            logger.debug(f"[{id_session}] Réponse IA enregistrée (ID DB: {ai_message_db_id}).")

            logger.debug(f"[{id_session}] Fin du traitement de la demande utilisateur.")
            return {
                "reponse_ia": reponse_ia,
                "intention_detectee": intention,
                "entites_extraites": entites_extraites,
                "recommandation_triage": recommandation_triage,
                "ai_message_db_id": ai_message_db_id,
                "chemin_audio_reponse_ia": chemin_audio_reponse_ia
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[{id_session}] Erreur inattendue dans MoteurDiagnostic.traiter_demande_utilisateur: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Une erreur interne est survenue dans le moteur de diagnostic. Veuillez réessayer plus tard ou contacter le support. Détails: {e}"
            )
