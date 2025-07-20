
# Cela permet aux autres modules d'importer directement depuis 'app.dependances'
# au lieu de 'app.dependances.injection'.

from .injection import (
    get_integrateur_llm,
    get_gestionnaire_connaissances,
    get_gestionnaire_contexte,
    get_gestionnaire_vocal,
    get_gestionnaire_authentification,
    get_gestionnaire_patient,
    get_gestionnaire_medecin,
    get_gestionnaire_structure_medicale,
    get_gestionnaire_rendezvous,
    get_gestionnaire_telemedecine,
    get_gestionnaire_geolocalisation,
    get_moteur_diagnostic
)


__all__ = [
    "get_integrateur_llm",
    "get_gestionnaire_connaissances",
    "get_gestionnaire_contexte",
    "get_gestionnaire_vocal",
    "get_gestionnaire_authentification",
    "get_gestionnaire_patient",
    "get_gestionnaire_medecin",
    "get_gestionnaire_structure_medicale",
    "get_gestionnaire_rendezvous",
    "get_gestionnaire_telemedecine",
    "get_gestionnaire_geolocalisation",
    "get_moteur_diagnostic"
]
