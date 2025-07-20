# app/api/v1/__init__.py

# Importation explicite des objets router pour éviter les problèmes de circularité
# et pour définir clairement ce qui est exporté par ce package.

# Routeurs existants
from .points_terminaux import router as points_terminaux_router
from .teleassistance import router as teleassistance_router

# Nouveaux routeurs
from .authentification_router import authentification_router
from .patient_router import patient_router
from .medecin_router import medecin_router
from .structure_medicale_router import structure_medicale_router
from .rendez_vous_router import rendez_vous_router
from .telemedecine_router_v2 import telemedecine_router_v2 # Renommé pour éviter les conflits
from .geolocalisation_router import geolocalisation_router

# Liste des routeurs à exporter.
# Cela permet de faire 'from app.api.v1 import authentification_router, ...' dans main.py
__all__ = [
    "points_terminaux_router",
    "teleassistance_router",
    "authentification_router",
    "patient_router",
    "medecin_router",
    "structure_medicale_router",
    "rendez_vous_router",
    "telemedecine_router_v2",
    "geolocalisation_router",
]
