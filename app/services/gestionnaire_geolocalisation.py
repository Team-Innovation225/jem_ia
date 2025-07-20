# app/services/gestionnaire_geolocalisation.py
import logging
import math
from typing import List, Dict, Any, Optional

from fastapi import HTTPException, status

# Import des modèles de données
from app.base_de_donnees.modeles import DoctorEnDB, MedicalStructureEnDB
# Import des fonctions CRUD
from app.base_de_donnees import crud
# Import de la connexion à la base de données
from app.base_de_donnees.connexion import get_db_connection
# Import des paramètres de configuration
from app.configuration.parametres import parametres

logger = logging.getLogger(__name__)

class GestionnaireGeolocalisation:
    """
    Gère les fonctionnalités de géolocalisation, permettant de rechercher
    des médecins et des structures médicales par proximité.
    """

    def __init__(self):
        logger.info("GestionnaireGeolocalisation initialisé.")

    def _parse_coordonnees_gps(self, coords_str: Optional[str]) -> Optional[Dict[str, float]]:
        """
        Parse une chaîne de coordonnées GPS "latitude,longitude" en un dictionnaire.
        """
        if not coords_str:
            return None
        try:
            latitude, longitude = map(float, coords_str.split(','))
            return {"latitude": latitude, "longitude": longitude}
        except ValueError:
            logger.warning(f"Coordonnées GPS invalides: {coords_str}")
            return None

    def _calculer_distance_haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calcule la distance entre deux points GPS en kilomètres en utilisant la formule de Haversine.
        """
        R = 6371  # Rayon moyen de la Terre en kilomètres

        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad

        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        distance = R * c
        return distance

    async def rechercher_medecins_proximite(self, latitude: float, longitude: float, rayon_km: Optional[float] = None) -> List[DoctorEnDB]:
        """
        Recherche les médecins à proximité des coordonnées GPS données.
        """
        if rayon_km is None:
            rayon_km = parametres.GEOLOCATION_SEARCH_RADIUS_KM

        conn = None
        medecins_proches = []
        try:
            conn = get_db_connection()
            all_doctors = crud.lire_tous_doctors(conn, limit=10000) # Récupérer tous les médecins (optimisation à considérer pour très grande DB)
            
            for doctor in all_doctors:
                doctor_coords = self._parse_coordonnees_gps(doctor.coordonnees_gps)
                if doctor_coords:
                    distance = self._calculer_distance_haversine(
                        latitude, longitude, doctor_coords["latitude"], doctor_coords["longitude"]
                    )
                    if distance <= rayon_km:
                        # Ajouter la distance au modèle DoctorEnDB si on veut la retourner
                        # Pour l'instant, on se contente de filtrer
                        medecins_proches.append(doctor)
            
            logger.info(f"Recherche de médecins à proximité de ({latitude}, {longitude}) dans un rayon de {rayon_km} km. Trouvé: {len(medecins_proches)}.")
            return medecins_proches
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de médecins à proximité: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur interne du serveur lors de la recherche de médecins."
            )
        finally:
            if conn:
                conn.close()

    async def rechercher_structures_medicales_proximite(self, latitude: float, longitude: float, rayon_km: Optional[float] = None) -> List[MedicalStructureEnDB]:
        """
        Recherche les structures médicales à proximité des coordonnées GPS données.
        """
        if rayon_km is None:
            rayon_km = parametres.GEOLOCATION_SEARCH_RADIUS_KM

        conn = None
        structures_proches = []
        try:
            conn = get_db_connection()
            all_structures = crud.lire_toutes_medical_structures(conn, limit=10000) # Récupérer toutes les structures
            
            for structure in all_structures:
                structure_coords = self._parse_coordonnees_gps(structure.coordonnees_gps)
                if structure_coords:
                    distance = self._calculer_distance_haversine(
                        latitude, longitude, structure_coords["latitude"], structure_coords["longitude"]
                    )
                    if distance <= rayon_km:
                        structures_proches.append(structure)
            
            logger.info(f"Recherche de structures médicales à proximité de ({latitude}, {longitude}) dans un rayon de {rayon_km} km. Trouvé: {len(structures_proches)}.")
            return structures_proches
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de structures médicales à proximité: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur interne du serveur lors de la recherche de structures médicales."
            )
        finally:
            if conn:
                conn.close()
