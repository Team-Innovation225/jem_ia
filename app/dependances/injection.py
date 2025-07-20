# app/dependances/injection.py
import logging
from typing import Optional

# Import des services pour l'initialisation
from app.services.integrateur_llm import IntegrateurLLM
from app.services.gestionnaire_connaissances import GestionnaireConnaissances
from app.services.gestionnaire_contexte import GestionnaireContexte
from app.services.gestionnaire_vocal import GestionnaireVocal
from app.services.gestionnaire_authentification import GestionnaireAuthentification
from app.services.gestionnaire_patient import GestionnairePatient
from app.services.gestionnaire_medecin import GestionnaireMedecin
from app.services.gestionnaire_structure_medicale import GestionnaireStructureMedicale
from app.services.gestionnaire_rendezvous import GestionnaireRendezvous
from app.services.gestionnaire_telemedecine import GestionnaireTelemedecine
from app.services.gestionnaire_geolocalisation import GestionnaireGeolocalisation
from app.services.moteur_diagnostic import MoteurDiagnostic
from fastapi import Depends

logger = logging.getLogger(__name__)

# Instances de services (singletons)
_integrateur_llm_instance: Optional[IntegrateurLLM] = None
_gestionnaire_connaissances_instance: Optional[GestionnaireConnaissances] = None
_gestionnaire_contexte_instance: Optional[GestionnaireContexte] = None
_gestionnaire_vocal_instance: Optional[GestionnaireVocal] = None
_gestionnaire_authentification_instance: Optional[GestionnaireAuthentification] = None
_gestionnaire_patient_instance: Optional[GestionnairePatient] = None
_gestionnaire_medecin_instance: Optional[GestionnaireMedecin] = None
_gestionnaire_structure_medicale_instance: Optional[GestionnaireStructureMedicale] = None
_gestionnaire_rendezvous_instance: Optional[GestionnaireRendezvous] = None
_gestionnaire_telemedecine_instance: Optional[GestionnaireTelemedecine] = None
_gestionnaire_geolocalisation_instance: Optional[GestionnaireGeolocalisation] = None
_moteur_diagnostic_instance: Optional[MoteurDiagnostic] = None


# Fonctions d'initialisation (appelées dans le lifespan de FastAPI)
async def init_integrateur_llm_instance():
    global _integrateur_llm_instance
    if _integrateur_llm_instance is None:
        _integrateur_llm_instance = IntegrateurLLM()
        logger.info("IntegrateurLLM initialisé.")
    else:
        logger.debug("IntegrateurLLM déjà initialisé.")

async def init_gestionnaire_connaissances_instance():
    global _gestionnaire_connaissances_instance
    if _gestionnaire_connaissances_instance is None:
        _gestionnaire_connaissances_instance = GestionnaireConnaissances()
        logger.info("GestionnaireConnaissances initialisé.")
    else:
        logger.debug("GestionnaireConnaissances déjà initialisé.")

async def init_gestionnaire_contexte_instance():
    global _gestionnaire_contexte_instance
    if _gestionnaire_contexte_instance is None:
        _gestionnaire_contexte_instance = GestionnaireContexte()
        logger.info("GestionnaireContexte initialisé.")
    else:
        logger.debug("GestionnaireContexte déjà initialisé.")

async def init_gestionnaire_vocal_instance():
    global _gestionnaire_vocal_instance
    if _gestionnaire_vocal_instance is None:
        _gestionnaire_vocal_instance = GestionnaireVocal()
        logger.info("GestionnaireVocal initialisé.")
    else:
        logger.debug("GestionnaireVocal déjà initialisé.")

async def init_gestionnaire_authentification_instance():
    global _gestionnaire_authentification_instance
    if _gestionnaire_authentification_instance is None:
        if _gestionnaire_contexte_instance is None: # Assurer la dépendance
            logger.warning("GestionnaireContexte non initialisé avant GestionnaireAuthentification. Tentative d'initialisation.")
            await init_gestionnaire_contexte_instance()
        _gestionnaire_authentification_instance = GestionnaireAuthentification(
            gestionnaire_contexte=_gestionnaire_contexte_instance
        )
        logger.info("GestionnaireAuthentification initialisé.")
    else:
        logger.debug("GestionnaireAuthentification déjà initialisé.")

async def init_moteur_diagnostic_instance():
    global _moteur_diagnostic_instance
    if _moteur_diagnostic_instance is None:
        logger.debug("Tentative d'initialisation de MoteurDiagnostic...")
        # Assurez-vous que les dépendances du MoteurDiagnostic sont initialisées
        if _gestionnaire_connaissances_instance is None:
            logger.warning("GestionnaireConnaissances non initialisé avant MoteurDiagnostic. Tentative d'initialisation.")
            await init_gestionnaire_connaissances_instance()
        if _integrateur_llm_instance is None:
            logger.warning("IntegrateurLLM non initialisé avant MoteurDiagnostic. Tentative d'initialisation.")
            await init_integrateur_llm_instance()
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte non initialisé avant MoteurDiagnostic. Tentative d'initialisation.")
            await init_gestionnaire_contexte_instance()
        if _gestionnaire_vocal_instance is None:
            logger.warning("GestionnaireVocal non initialisé avant MoteurDiagnostic. Tentative d'initialisation.")
            await init_gestionnaire_vocal_instance()

        _moteur_diagnostic_instance = MoteurDiagnostic(
            gestionnaire_connaissances=_gestionnaire_connaissances_instance,
            integrateur_llm=_integrateur_llm_instance,
            gestionnaire_contexte=_gestionnaire_contexte_instance,
            gestionnaire_vocal=_gestionnaire_vocal_instance
        )
        logger.info("MoteurDiagnostic initialisé.")
    else:
        logger.debug("MoteurDiagnostic déjà initialisé.")

async def init_gestionnaire_patient_instance():
    global _gestionnaire_patient_instance
    if _gestionnaire_patient_instance is None:
        logger.debug(f"Initialisation de GestionnairePatient: Vérification des dépendances...")
        
        # S'assurer que les dépendances sont initialisées avant de les passer
        if _integrateur_llm_instance is None:
            logger.warning("IntegrateurLLM est None lors de l'initialisation de GestionnairePatient. Initialisation forcée.")
            await init_integrateur_llm_instance()
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte est None lors de l'initialisation de GestionnairePatient. Initialisation forcée.")
            await init_gestionnaire_contexte_instance()
        if _moteur_diagnostic_instance is None:
            logger.warning("MoteurDiagnostic est None lors de l'initialisation de GestionnairePatient. Initialisation forcée.")
            await init_moteur_diagnostic_instance() # S'assurer qu'il est initialisé

        # Log l'état des instances juste avant la création de GestionnairePatient
        logger.debug(f"État des dépendances pour GestionnairePatient: "
                     f"LLM={_integrateur_llm_instance is not None}, "
                     f"Contexte={_gestionnaire_contexte_instance is not None}, "
                     f"MoteurDiag={_moteur_diagnostic_instance is not None}")

        _gestionnaire_patient_instance = GestionnairePatient(
            integrateur_llm=_integrateur_llm_instance,
            gestionnaire_contexte=_gestionnaire_contexte_instance,
            moteur_diagnostic=_moteur_diagnostic_instance
        )
        logger.info("GestionnairePatient initialisé.")
    else:
        logger.debug("GestionnairePatient déjà initialisé.")

async def init_gestionnaire_medecin_instance():
    global _gestionnaire_medecin_instance
    if _gestionnaire_medecin_instance is None:
        logger.debug(f"Initialisation de GestionnaireMedecin: Vérification des dépendances...")
        # Assurez-vous que les dépendances sont initialisées avant de les passer
        if _integrateur_llm_instance is None:
            logger.warning("IntegrateurLLM est None lors de l'initialisation de GestionnaireMedecin. Initialisation forcée.")
            await init_integrateur_llm_instance()
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte est None lors de l'initialisation de GestionnaireMedecin. Initialisation forcée.")
            await init_gestionnaire_contexte_instance()
        if _moteur_diagnostic_instance is None:
            logger.warning("MoteurDiagnostic est None lors de l'initialisation de GestionnaireMedecin. Initialisation forcée.")
            await init_moteur_diagnostic_instance()
        if _gestionnaire_connaissances_instance is None:
            logger.warning("GestionnaireConnaissances est None lors de l'initialisation de GestionnaireMedecin. Initialisation forcée.")
            await init_gestionnaire_connaissances_instance()

        # Log l'état des instances juste avant la création de GestionnaireMedecin
        logger.debug(f"État des dépendances pour GestionnaireMedecin: "
                     f"LLM={_integrateur_llm_instance is not None}, "
                     f"Contexte={_gestionnaire_contexte_instance is not None}, "
                     f"MoteurDiag={_moteur_diagnostic_instance is not None}, "
                     f"Connaissances={_gestionnaire_connaissances_instance is not None}")

        _gestionnaire_medecin_instance = GestionnaireMedecin(
            integrateur_llm=_integrateur_llm_instance,
            gestionnaire_contexte=_gestionnaire_contexte_instance,
            moteur_diagnostic=_moteur_diagnostic_instance,
            gestionnaire_connaissances=_gestionnaire_connaissances_instance
        )
        logger.info("GestionnaireMedecin initialisé.")
    else:
        logger.debug("GestionnaireMedecin déjà initialisé.")

async def init_gestionnaire_structure_medicale_instance():
    global _gestionnaire_structure_medicale_instance
    if _gestionnaire_structure_medicale_instance is None:
        logger.debug(f"Initialisation de GestionnaireStructureMedicale: Vérification des dépendances...")
        if _integrateur_llm_instance is None:
            logger.warning("IntegrateurLLM est None lors de l'initialisation de GestionnaireStructureMedicale. Initialisation forcée.")
            await init_integrateur_llm_instance()
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte est None lors de l'initialisation de GestionnaireStructureMedicale. Initialisation forcée.")
            await init_gestionnaire_contexte_instance()
        
        # Log l'état des instances juste avant la création de GestionnaireStructureMedicale
        logger.debug(f"État des dépendances pour GestionnaireStructureMedicale: "
                     f"LLM={_integrateur_llm_instance is not None}, "
                     f"Contexte={_gestionnaire_contexte_instance is not None}")

        _gestionnaire_structure_medicale_instance = GestionnaireStructureMedicale(
            integrateur_llm=_integrateur_llm_instance,
            gestionnaire_contexte=_gestionnaire_contexte_instance
        )
        logger.info("GestionnaireStructureMedicale initialisé.")
    else:
        logger.debug("GestionnaireStructureMedicale déjà initialisé.")

async def init_gestionnaire_rendezvous_instance():
    global _gestionnaire_rendezvous_instance
    if _gestionnaire_rendezvous_instance is None:
        logger.debug(f"Initialisation de GestionnaireRendezvous: Vérification des dépendances...")
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte est None lors de l'initialisation de GestionnaireRendezvous. Initialisation forcée.")
            await init_gestionnaire_contexte_instance()
        
        # Log l'état des instances juste avant la création de GestionnaireRendezvous
        logger.debug(f"État des dépendances pour GestionnaireRendezvous: "
                     f"Contexte={_gestionnaire_contexte_instance is not None}")

        _gestionnaire_rendezvous_instance = GestionnaireRendezvous(
            gestionnaire_contexte=_gestionnaire_contexte_instance
        )
        logger.info("GestionnaireRendezvous initialisé.")
    else:
        logger.debug("GestionnaireRendezvous déjà initialisé.")

async def init_gestionnaire_telemedecine_instance():
    global _gestionnaire_telemedecine_instance
    if _gestionnaire_telemedecine_instance is None:
        logger.debug(f"Initialisation de GestionnaireTelemedecine: Vérification des dépendances...")
        if _integrateur_llm_instance is None:
            logger.warning("IntegrateurLLM est None lors de l'initialisation de GestionnaireTelemedecine. Initialisation forcée.")
            await init_integrateur_llm_instance()
        if _gestionnaire_contexte_instance is None:
            logger.warning("GestionnaireContexte est None lors de l'initialisation de GestionnaireTelemedecine. Initialisation forcée.")
            await init_gestionnaire_contexte_instance()
        
        # Log l'état des instances juste avant la création de GestionnaireTelemedecine
        logger.debug(f"État des dépendances pour GestionnaireTelemedecine: "
                     f"LLM={_integrateur_llm_instance is not None}, "
                     f"Contexte={_gestionnaire_contexte_instance is not None}")

        _gestionnaire_telemedecine_instance = GestionnaireTelemedecine(
            integrateur_llm=_integrateur_llm_instance,
            gestionnaire_contexte=_gestionnaire_contexte_instance
        )
        logger.info("GestionnaireTelemedecine initialisé.")
    else:
        logger.debug("GestionnaireTelemedecine déjà initialisé.")

async def init_gestionnaire_geolocalisation_instance():
    global _gestionnaire_geolocalisation_instance
    if _gestionnaire_geolocalisation_instance is None:
        _gestionnaire_geolocalisation_instance = GestionnaireGeolocalisation()
        logger.info("GestionnaireGeolocalisation initialisé.")
    else:
        logger.debug("GestionnaireGeolocalisation déjà initialisé.")


# Fonctions pour récupérer les instances (utilisées par FastAPI.Depends)
def get_integrateur_llm() -> IntegrateurLLM:
    if _integrateur_llm_instance is None:
        raise Exception("IntegrateurLLM n'est pas initialisé.")
    return _integrateur_llm_instance

def get_gestionnaire_connaissances() -> GestionnaireConnaissances:
    if _gestionnaire_connaissances_instance is None:
        raise Exception("GestionnaireConnaissances n'est pas initialisé.")
    return _gestionnaire_connaissances_instance

def get_gestionnaire_contexte() -> GestionnaireContexte:
    if _gestionnaire_contexte_instance is None:
        raise Exception("GestionnaireContexte n'est pas initialisé.")
    return _gestionnaire_contexte_instance

def get_gestionnaire_vocal() -> GestionnaireVocal:
    if _gestionnaire_vocal_instance is None:
        raise Exception("GestionnaireVocal n'est pas initialisé.")
    return _gestionnaire_vocal_instance

def get_gestionnaire_authentification() -> GestionnaireAuthentification:
    if _gestionnaire_authentification_instance is None:
        raise Exception("GestionnaireAuthentification n'est pas initialisé.")
    return _gestionnaire_authentification_instance

async def get_gestionnaire_authentification_dep() -> GestionnaireAuthentification:
    from app.dependances.injection import init_gestionnaire_authentification_instance, _gestionnaire_authentification_instance
    if _gestionnaire_authentification_instance is None:
        await init_gestionnaire_authentification_instance()
    return _gestionnaire_authentification_instance

def get_gestionnaire_patient() -> GestionnairePatient:
    if _gestionnaire_patient_instance is None:
        raise Exception("GestionnairePatient n'est pas initialisé.")
    return _gestionnaire_patient_instance

def get_gestionnaire_medecin() -> GestionnaireMedecin:
    if _gestionnaire_medecin_instance is None:
        raise Exception("GestionnaireMedecin n'est pas initialisé.")
    return _gestionnaire_medecin_instance

def get_gestionnaire_structure_medicale() -> GestionnaireStructureMedicale:
    if _gestionnaire_structure_medicale_instance is None:
        raise Exception("GestionnaireStructureMedicale n'est pas initialisé.")
    return _gestionnaire_structure_medicale_instance

def get_gestionnaire_rendezvous() -> GestionnaireRendezvous:
    if _gestionnaire_rendezvous_instance is None:
        raise Exception("GestionnaireRendezvous n'est pas initialisé.")
    return _gestionnaire_rendezvous_instance

def get_gestionnaire_telemedecine() -> GestionnaireTelemedecine:
    if _gestionnaire_telemedecine_instance is None:
        raise Exception("GestionnaireTelemedecine n'est pas initialisé.")
    return _gestionnaire_telemedecine_instance

def get_gestionnaire_geolocalisation() -> GestionnaireGeolocalisation:
    if _gestionnaire_geolocalisation_instance is None:
        raise Exception("GestionnaireGeolocalisation n'est pas initialisé.")
    return _gestionnaire_geolocalisation_instance

def get_moteur_diagnostic() -> MoteurDiagnostic:
    if _moteur_diagnostic_instance is None:
        raise Exception("MoteurDiagnostic n'est pas initialisé.")
    return _moteur_diagnostic_instance

