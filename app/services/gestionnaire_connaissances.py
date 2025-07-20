# app/services/gestionnaire_connaissances.py
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import (
    MaladieCreer, MaladieEnDB, MaladieMettreAJour, # <-- MaladieMettreAJour AJOUTÉ
    SymptomeCreer, SymptomeEnDB, SymptomeMettreAJour, # <-- SymptomeMettreAJour AJOUTÉ
    MaladieSymptomeLienCreer, MaladieSymptomeLienEnDB
)

logger = logging.getLogger(__name__)

class GestionnaireConnaissances:
    """
    Gère la base de connaissances médicale, y compris les maladies, les symptômes
    et leurs relations, pour soutenir le moteur de diagnostic.
    """
    def __init__(self):
        logger.info("GestionnaireConnaissances initialisé.")

    async def ajouter_maladie(self, maladie_data: MaladieCreer) -> Optional[MaladieEnDB]:
        """Ajoute une nouvelle maladie à la base de connaissances."""
        conn = None
        try:
            conn = get_db_connection()
            # Vérifier si la maladie existe déjà par son nom français
            existing_maladie = crud.lire_maladie_par_nom(conn, maladie_data.nom_fr)
            if existing_maladie:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Une maladie avec le nom '{maladie_data.nom_fr}' existe déjà."
                )
            
            nouvelle_maladie = crud.creer_maladie(conn, maladie_data)
            if not nouvelle_maladie:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de l'ajout de la maladie."
                )
            logger.info(f"Maladie '{nouvelle_maladie.nom_fr}' ajoutée avec succès (ID: {nouvelle_maladie.id}).")
            return nouvelle_maladie
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de la maladie '{maladie_data.nom_fr}': {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def obtenir_details_maladie(self, nom_maladie: str) -> Optional[MaladieEnDB]:
        """Récupère les détails d'une maladie par son nom français."""
        conn = None
        try:
            conn = get_db_connection()
            maladie = crud.lire_maladie_par_nom(conn, nom_maladie)
            if not maladie:
                logger.warning(f"Maladie '{nom_maladie}' non trouvée.")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Maladie '{nom_maladie}' non trouvée.")
            return maladie
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des détails de la maladie '{nom_maladie}': {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_maladie(self, maladie_id: int, update_data: MaladieMettreAJour) -> Optional[MaladieEnDB]:
        """Met à jour les informations d'une maladie existante."""
        conn = None
        try:
            conn = get_db_connection()
            existing_maladie = crud.lire_maladie_par_id(conn, maladie_id)
            if not existing_maladie:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Maladie non trouvée.")

            # Convertir le modèle Pydantic en dictionnaire pour la fonction CRUD
            data_to_update = update_data.model_dump(exclude_unset=True)
            
            success = crud.mettre_a_jour_maladie(conn, maladie_id, data_to_update)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de la mise à jour de la maladie."
                )
            updated_maladie = crud.lire_maladie_par_id(conn, maladie_id)
            logger.info(f"Maladie ID {maladie_id} mise à jour avec succès.")
            return updated_maladie
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la maladie ID {maladie_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def ajouter_symptome(self, symptome_data: SymptomeCreer) -> Optional[SymptomeEnDB]:
        """Ajoute un nouveau symptôme à la base de connaissances."""
        conn = None
        try:
            conn = get_db_connection()
            existing_symptome = crud.lire_symptome_par_nom(conn, symptome_data.nom_fr)
            if existing_symptome:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Un symptôme avec le nom '{symptome_data.nom_fr}' existe déjà."
                )
            
            nouveau_symptome = crud.creer_symptome(conn, symptome_data)
            if not nouveau_symptome:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de l'ajout du symptôme."
                )
            logger.info(f"Symptôme '{nouveau_symptome.nom_fr}' ajouté avec succès (ID: {nouveau_symptome.id}).")
            return nouveau_symptome
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout du symptôme '{symptome_data.nom_fr}': {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def obtenir_details_symptome(self, nom_symptome: str) -> Optional[SymptomeEnDB]:
        """Récupère les détails d'un symptôme par son nom français."""
        conn = None
        try:
            conn = get_db_connection()
            symptome = crud.lire_symptome_par_nom(conn, nom_symptome)
            if not symptome:
                logger.warning(f"Symptôme '{nom_symptome}' non trouvé.")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symptôme '{nom_symptome}' non trouvé.")
            return symptome
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des détails du symptôme '{nom_symptome}': {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_symptome(self, symptome_id: int, update_data: SymptomeMettreAJour) -> Optional[SymptomeEnDB]:
        """Met à jour les informations d'un symptôme existant."""
        conn = None
        try:
            conn = get_db_connection()
            existing_symptome = crud.lire_symptome_par_id(conn, symptome_id)
            if not existing_symptome:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symptôme non trouvé.")

            data_to_update = update_data.model_dump(exclude_unset=True)
            
            success = crud.mettre_a_jour_symptome(conn, symptome_id, data_to_update)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de la mise à jour du symptôme."
                )
            updated_symptome = crud.lire_symptome_par_id(conn, symptome_id)
            logger.info(f"Symptôme ID {symptome_id} mis à jour avec succès.")
            return updated_symptome
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du symptôme ID {symptome_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()


    async def rechercher_maladies_par_symptomes(self, symptomes: List[str]) -> List[Dict[str, Any]]:
        """
        Recherche les maladies pertinentes en fonction d'une liste de symptômes.
        Retourne une liste de maladies avec un score de confiance.
        """
        conn = None
        try:
            conn = get_db_connection()
            all_maladies = crud.lire_toutes_maladies(conn)
            
            resultats_pertinents = []
            for maladie in all_maladies:
                symptomes_maladie_lower = [s.lower() for s in maladie.symptomes_courants_mots_cles]
                symptomes_utilisateur_lower = [s.lower() for s in symptomes]

                # Calculer la correspondance des symptômes
                symptomes_communs = set(symptomes_maladie_lower).intersection(set(symptomes_utilisateur_lower))
                
                if symptomes_communs:
                    # Calcul simple de confiance basé sur le nombre de symptômes correspondants
                    # par rapport au nombre total de symptômes de la maladie
                    confiance = (len(symptomes_communs) / len(symptomes_maladie_lower)) * 100 if symptomes_maladie_lower else 0
                    
                    resultats_pertinents.append({
                        "maladie": maladie,
                        "confiance": confiance,
                        "symptomes_correspondants": list(symptomes_communs)
                    })
            
            # Trier par confiance décroissante
            resultats_pertinents.sort(key=lambda x: x["confiance"], reverse=True)
            logger.info(f"Recherche de maladies par symptômes '{symptomes}': {len(resultats_pertinents)} résultats pertinents trouvés.")
            return resultats_pertinents
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de maladies par symptômes: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def lier_maladie_symptome(self, maladie_id: int, symptome_id: int, force_lien: Optional[float] = None) -> Optional[MaladieSymptomeLienEnDB]:
        """Crée un lien entre une maladie et un symptôme."""
        conn = None
        try:
            conn = get_db_connection()
            maladie_exist = crud.lire_maladie_par_id(conn, maladie_id)
            symptome_exist = crud.lire_symptome_par_id(conn, symptome_id)
            
            if not maladie_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Maladie ID {maladie_id} non trouvée.")
            if not symptome_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Symptôme ID {symptome_id} non trouvé.")

            # Vérifier si le lien existe déjà pour éviter les doublons
            existing_links = crud.lire_liens_par_maladie_id(conn, maladie_id)
            for link in existing_links:
                if link.symptome_id == symptome_id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Un lien existe déjà entre la maladie {maladie_id} et le symptôme {symptome_id}."
                    )

            lien_data = MaladieSymptomeLienCreer(maladie_id=maladie_id, symptome_id=symptome_id, force_lien=force_lien)
            nouveau_lien = crud.creer_maladie_symptome_lien(conn, lien_data)
            
            if not nouveau_lien:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Échec de la création du lien maladie-symptôme."
                )
            logger.info(f"Lien créé entre maladie {maladie_id} et symptôme {symptome_id} (ID: {nouveau_lien.id}).")
            return nouveau_lien
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la création du lien maladie-symptôme ({maladie_id}-{symptome_id}): {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

