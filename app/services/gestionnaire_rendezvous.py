# app/services/gestionnaire_rendezvous.py
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from fastapi import HTTPException, status

from app.base_de_donnees.connexion import get_db_connection
from app.base_de_donnees import crud
from app.base_de_donnees.modeles import (
    AppointmentCreer, AppointmentEnDB, AppointmentMettreAJour,
    DoctorEnDB, PatientEnDB
)

# Import pour le typage uniquement
from app.services.gestionnaire_contexte import GestionnaireContexte

logger = logging.getLogger(__name__)

class GestionnaireRendezvous:
    """
    Gère les opérations métier liées aux rendez-vous, y compris la création,
    la mise à jour, l'annulation et la recherche de disponibilités.
    """
    def __init__(
        self,
        gestionnaire_contexte: GestionnaireContexte
    ):
        self.gestionnaire_contexte = gestionnaire_contexte
        logger.info("GestionnaireRendezvous initialisé.")

    async def prendre_rendezvous(self, appointment_data: AppointmentCreer) -> Optional[AppointmentEnDB]:
        """
        Permet à un patient de prendre un rendez-vous avec un médecin.
        Vérifie la disponibilité.
        """
        conn = None
        try:
            conn = get_db_connection()
            # 1. Vérifier l'existence du patient et du médecin
            patient_exist = crud.lire_patient_par_id(conn, appointment_data.patient_id)
            if not patient_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")
            
            doctor_exist = crud.lire_medecin_par_id(conn, appointment_data.doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Médecin non trouvé.")

            # 2. Vérifier la disponibilité du médecin pour la plage horaire
            # Convertir les dates/heures en objets datetime si elles ne le sont pas déjà
            start_time_dt = datetime.fromisoformat(appointment_data.heure_debut)
            end_time_dt = datetime.fromisoformat(appointment_data.heure_fin)

            is_available = crud.verifier_disponibilite_medecin(
                conn, 
                appointment_data.doctor_id, 
                start_time_dt, 
                end_time_dt
            )
            
            if not is_available:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Le médecin n'est pas disponible à cette heure. Veuillez choisir un autre créneau."
                )

            # 3. Créer le rendez-vous
            nouveau_rendezvous = crud.creer_rendezvous(conn, appointment_data)
            if nouveau_rendezvous:
                logger.info(f"Rendez-vous créé avec succès (ID: {nouveau_rendezvous.id}) pour patient {nouveau_rendezvous.patient_id} et médecin {nouveau_rendezvous.doctor_id}.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"appointment_creation_{nouveau_rendezvous.id}",
                    role="system",
                    message=f"Rendez-vous créé pour patient {nouveau_rendezvous.patient_id} avec médecin {nouveau_rendezvous.doctor_id}.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "appointment_created", "appointment_id": nouveau_rendezvous.id, "patient_id": nouveau_rendezvous.patient_id, "doctor_id": nouveau_rendezvous.doctor_id, "heure_debut": nouveau_rendezvous.heure_debut}
                )
            return nouveau_rendezvous
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la prise de rendez-vous: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def mettre_a_jour_statut_rendezvous(self, appointment_id: int, nouveau_statut: str) -> Optional[AppointmentEnDB]:
        """
        Met à jour le statut d'un rendez-vous.
        """
        conn = None
        try:
            conn = get_db_connection()
            rendezvous_exist = crud.lire_rendezvous_par_id(conn, appointment_id)
            if not rendezvous_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous non trouvé.")
            
            update_data = {"statut": nouveau_statut}
            succes = crud.mettre_a_jour_rendezvous(conn, appointment_id, update_data)
            if succes:
                rendezvous_mis_a_jour = crud.lire_rendezvous_par_id(conn, appointment_id)
                logger.info(f"Statut du rendez-vous ID {appointment_id} mis à jour à '{nouveau_statut}'.")
                await self.gestionnaire_contexte.ajouter_log_conversation(
                    id_session=f"appointment_update_{appointment_id}",
                    role="system",
                    message=f"Statut du rendez-vous ID {appointment_id} mis à jour à '{nouveau_statut}'.",
                    type_message="evenement_systeme",
                    donnees_structurees={"event": "appointment_status_updated", "appointment_id": appointment_id, "new_status": nouveau_statut}
                )
                return rendezvous_mis_a_jour
            return None
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour du statut du rendez-vous {appointment_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

    async def annuler_rendezvous(self, appointment_id: int) -> bool:
        """
        Annule un rendez-vous en mettant son statut à 'annulé'.
        """
        return await self.mettre_a_jour_statut_rendezvous(appointment_id, "annulé") is not None

    async def rechercher_disponibilites_medecin(self, doctor_id: int, date_recherche: date, duree_min: int = 30) -> List[Dict[str, str]]:
        """
        Recherche les créneaux de disponibilité d'un médecin pour une date donnée.
        Retourne une liste de créneaux disponibles.
        """
        conn = None
        try:
            conn = get_db_connection()
            doctor_exist = crud.lire_medecin_par_id(conn, doctor_id)
            if not doctor_exist:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Médecin non trouvé.")

            # Récupérer tous les rendez-vous existants pour ce médecin à cette date
            existing_appointments = crud.lire_rendezvous_par_medecin_et_date(conn, doctor_id, date_recherche)

            # Définir les heures de travail par défaut du médecin (exemple: 9h-17h)
            # Idéalement, ceci devrait venir du profil du médecin dans la DB
            journee_debut = datetime.combine(date_recherche, datetime.min.time().replace(hour=9))
            journee_fin = datetime.combine(date_recherche, datetime.min.time().replace(hour=17))

            creneaux_disponibles = []
            current_time = journee_debut

            while current_time + timedelta(minutes=duree_min) <= journee_fin:
                is_slot_free = True
                for appt in existing_appointments:
                    appt_start = datetime.fromisoformat(appt.heure_debut)
                    appt_end = datetime.fromisoformat(appt.heure_fin)
                    
                    # Vérifier si le créneau actuel chevauche un rendez-vous existant
                    if not (current_time + timedelta(minutes=duree_min) <= appt_start or current_time >= appt_end):
                        is_slot_free = False
                        # Avancer le temps au-delà du rendez-vous existant pour éviter les petits chevauchements
                        current_time = appt_end
                        break # Sortir de la boucle interne et vérifier le nouveau current_time

                if is_slot_free:
                    creneaux_disponibles.append({
                        "heure_debut": current_time.isoformat(),
                        "heure_fin": (current_time + timedelta(minutes=duree_min)).isoformat()
                    })
                    current_time += timedelta(minutes=duree_min)
                # Si le slot n'était pas libre et current_time a été avancé, la boucle while le gérera.
                # Si le slot n'était pas libre et current_time n'a pas été avancé (ex: chevauchement partiel),
                # il faut avancer d'une petite unité pour re-vérifier.
                else:
                    current_time += timedelta(minutes=1)

            logger.info(f"Recherche de disponibilités pour médecin {doctor_id} le {date_recherche}: {len(creneaux_disponibles)} créneaux trouvés.")
            return creneaux_disponibles
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de disponibilités pour le médecin {doctor_id}: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")
        finally:
            if conn:
                conn.close()

