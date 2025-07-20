# app/dependances.py
import logging
from typing import Optional
from app.services.moteur_diagnostic import MoteurDiagnostic
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

# Instances uniques des dépendances
_moteur_diagnostic_instance: Optional[MoteurDiagnostic] = None
_gestionnaire_contexte_instance: Optional[GestionnaireContexte] = None

def get_moteur_diagnostic() -> MoteurDiagnostic:
    """
    Dépendance pour obtenir l'instance unique du MoteurDiagnostic.
    Doit être initialisée via init_moteur_diagnostic_instance avant d'être appelée.
    """
    if _moteur_diagnostic_instance is None:
        logger.error("MoteurDiagnostic n'a pas été initialisé. Appelez init_moteur_diagnostic_instance() au démarrage de l'application.")
        raise RuntimeError("MoteurDiagnostic n'a pas été initialisé.")
    return _moteur_diagnostic_instance

def get_gestionnaire_contexte() -> GestionnaireContexte:
    """
    Dépendance pour obtenir l'instance unique du GestionnaireContexte.
    Doit être initialisée via init_gestionnaire_contexte_instance avant d'être appelée.
    """
    if _gestionnaire_contexte_instance is None:
        logger.error("GestionnaireContexte n'a pas été initialisé. Appelez init_gestionnaire_contexte_instance() au démarrage de l'application.")
        raise RuntimeError("GestionnaireContexte n'a pas été initialisé.")
    return _gestionnaire_contexte_instance

async def init_moteur_diagnostic_instance():
    """Initialise l'instance unique du MoteurDiagnostic."""
    global _moteur_diagnostic_instance
    if _moteur_diagnostic_instance is None:
        _moteur_diagnostic_instance = MoteurDiagnostic()
        logger.info("MoteurDiagnostic initialisé via init_moteur_diagnostic_instance.")

async def init_gestionnaire_contexte_instance():
    """Initialise l'instance unique du GestionnaireContexte."""
    global _gestionnaire_contexte_instance
    if _gestionnaire_contexte_instance is None:
        _gestionnaire_contexte_instance = GestionnaireContexte()
        logger.info("GestionnaireContexte initialisé via init_gestionnaire_contexte_instance.")

