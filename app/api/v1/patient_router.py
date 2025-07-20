# app/api/v1/patient_router.py
import logging
from typing import List, Optional, Dict, Any
import mysql.connector

from fastapi import APIRouter, Depends, HTTPException, status, Response

# Import des modèles de données
from app.base_de_donnees.modeles import (
    PatientCreer, PatientEnDB, PatientMettreAJour,
    UserEnDB, HealthStatusLogCreer, HealthStatusLogEnDB,
    WearableDataCreer, WearableDataEnDB,
    MedicalReportEnDB
)

# Import des fonctions CRUD
from app.base_de_donnees import crud
# Import de la fonction de connexion à la DB
from app.base_de_donnees.connexion import get_db_connection

# Import des dépendances (services injectés)
from app.dependances.injection import (
    get_gestionnaire_patient,
    get_gestionnaire_authentification, # Pour les dépendances d'authentification
    get_gestionnaire_contexte # Pour les logs
)

# Import pour le typage uniquement
from app.services.gestionnaire_patient import GestionnairePatient
from app.services.gestionnaire_authentification import GestionnaireAuthentification
from app.services.gestionnaire_contexte import GestionnaireContexte

# Import des dépendances d'authentification corrigées
from app.api.v1.authentification_router import get_current_active_user, get_current_user_with_role

logger = logging.getLogger(__name__)

patient_router = APIRouter()

# --- Dépendance pour obtenir une connexion à la base de données ---
def obtenir_connexion_db():
    conn = get_db_connection()
    if not conn:
        logger.error("Impossible d'établir une connexion à la base de données: Connexion MySQL échouée.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Impossible d'établir une connexion à la base de données: Connexion MySQL échouée."
        )
    try:
        yield conn
    finally:
        if conn and conn.is_connected():
            conn.close()

# --- Endpoints pour la gestion des patients ---

@patient_router.post(
    "/",
    response_model=PatientEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau profil patient",
    description="Crée un profil patient lié à un utilisateur existant. Nécessite un rôle 'admin' ou 'patient' (pour s'auto-créer son profil)."
)
async def creer_patient_api(
    patient_data: PatientCreer,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    # L'utilisateur doit être authentifié et avoir le rôle approprié
    current_user: UserEnDB = Depends(get_current_user_with_role(["admin", "patient"])),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient) # Injection du gestionnaire
):
    """
    Crée un profil patient. Si l'utilisateur est un patient, il ne peut créer que son propre profil.
    Les administrateurs peuvent créer des profils pour n'importe quel user_id.
    """
    # Vérifier que le user_id du patient correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient" and patient_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Un patient ne peut créer un profil que pour lui-même."
        )
    
    # Vérifier si un profil patient existe déjà pour cet user_id
    existing_patient = crud.lire_patient_par_user_id(db, patient_data.user_id)
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un profil patient existe déjà pour cet utilisateur."
        )

    try:
        nouveau_patient = await patient_manager.creer_profil_patient_avec_donnees(patient_data)
        if not nouveau_patient:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profil patient non créé.")
        return nouveau_patient
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la création du profil patient pour user_id {patient_data.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.get(
    "/{patient_id}",
    response_model=PatientEnDB,
    summary="Obtenir un profil patient par ID",
    description="Récupère les informations d'un profil patient spécifique. Nécessite un rôle 'admin' ou être le patient concerné."
)
async def lire_patient_par_id_api(
    patient_id: int,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Lit un profil patient. Seul l'admin ou le patient lui-même peut accéder à son profil.
    """
    patient = crud.lire_patient_par_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil patient non trouvé.")
    
    # Vérification d'autorisation
    if current_user.role == "patient" and patient.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé. Vous ne pouvez consulter que votre propre profil patient.")
    
    try:
        return patient
    except Exception as e:
        logger.error(f"Erreur lors de la lecture du profil patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.get(
    "/",
    response_model=List[PatientEnDB],
    summary="Lister tous les profils patients",
    description="Liste tous les profils patients. Nécessite un rôle 'admin'."
)
async def lire_tous_patients_api(
    limite: int = 100,
    decalage: int = 0,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_user_with_role(["admin"])) # Seul l'admin peut lister tous les patients
):
    """
    Liste tous les profils patients avec pagination.
    """
    try:
        patients = crud.lire_tous_patients(db, limite, decalage)
        return patients
    except Exception as e:
        logger.error(f"Erreur lors de la lecture de tous les profils patients: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.put(
    "/{patient_id}",
    response_model=PatientEnDB,
    summary="Mettre à jour un profil patient",
    description="Met à jour les informations d'un profil patient. Nécessite un rôle 'admin' ou être le patient concerné."
)
async def mettre_a_jour_patient_api(
    patient_id: int,
    patient_update: PatientMettreAJour,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_active_user), # Utilisateur authentifié
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient) # Injection du gestionnaire
):
    """
    Met à jour un profil patient. Seul l'admin ou le patient lui-même peut mettre à jour son profil.
    """
    existing_patient = crud.lire_patient_par_id(db, patient_id)
    if not existing_patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil patient non trouvé.")
    
    # Vérification d'autorisation
    if current_user.role == "patient" and existing_patient.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé. Vous ne pouvez modifier que votre propre profil patient.")

    try:
        # Utiliser le gestionnaire pour la mise à jour
        patient_mis_a_jour = await patient_manager.mettre_a_jour_profil_patient(patient_id, patient_update)
        if not patient_mis_a_jour:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Échec de la mise à jour du profil patient.")
        return patient_mis_a_jour
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du profil patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un profil patient",
    description="Supprime un profil patient. Nécessite un rôle 'admin'."
)
async def supprimer_patient_api(
    patient_id: int,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_user_with_role(["admin"])) # Seul l'admin peut supprimer un patient
):
    """
    Supprime un profil patient.
    """
    try:
        succes = crud.supprimer_patient(db, patient_id)
        if not succes:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil patient non trouvé.")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du profil patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

# --- Endpoints pour les HealthStatusLog (Journaux de Santé) ---

@patient_router.post(
    "/{patient_id}/health_logs",
    response_model=HealthStatusLogEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau journal de santé pour un patient",
    description="Permet à un patient ou un administrateur de créer un journal de santé. Les patients ne peuvent créer que leurs propres journaux."
)
async def creer_health_status_log_api(
    patient_id: int,
    log_data: HealthStatusLogCreer,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Crée un journal de santé pour un patient.
    """
    # Vérifier que le patient_id correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient":
        patient_profile = crud.lire_patient_par_user_id(db, current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Un patient ne peut créer un journal de santé que pour lui-même."
            )
    
    # Vérifier si le patient existe réellement
    patient_exists = crud.lire_patient_par_id(db, patient_id)
    if not patient_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

    try:
        nouveau_log = crud.creer_health_status_log(db, log_data)
        if not nouveau_log:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Journal de santé non créé.")
        return nouveau_log
    except Exception as e:
        logger.error(f"Erreur lors de la création du journal de santé pour patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.get(
    "/{patient_id}/health_logs",
    response_model=List[HealthStatusLogEnDB],
    summary="Lister les journaux de santé d'un patient",
    description="Liste tous les journaux de santé pour un patient spécifique. Nécessite un rôle 'admin' ou être le patient concerné."
)
async def lire_health_status_logs_api(
    patient_id: int,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    limite: int = 100,
    decalage: int = 0,
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Liste les journaux de santé d'un patient.
    """
    # Vérifier que le patient_id correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient":
        patient_profile = crud.lire_patient_par_user_id(db, current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Un patient ne peut consulter que ses propres journaux de santé."
            )
    
    # Vérifier si le patient existe réellement
    patient_exists = crud.lire_patient_par_id(db, patient_id)
    if not patient_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

    try:
        logs = crud.lire_health_status_logs_par_patient(db, patient_id, limite, decalage)
        return logs
    except Exception as e:
        logger.error(f"Erreur lors de la lecture des journaux de santé pour patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

# --- Endpoints pour les WearableData (Données d'appareils connectés) ---

@patient_router.post(
    "/{patient_id}/wearable_data",
    response_model=WearableDataEnDB,
    status_code=status.HTTP_201_CREATED,
    summary="Enregistrer de nouvelles données d'appareil connecté pour un patient",
    description="Permet à un patient ou un administrateur d'enregistrer des données d'appareil connecté. Les patients ne peuvent enregistrer que leurs propres données."
)
async def creer_wearable_data_api(
    patient_id: int,
    data: WearableDataCreer,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Enregistre des données d'appareil connecté pour un patient.
    """
    # Vérifier que le patient_id correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient":
        patient_profile = crud.lire_patient_par_user_id(db, current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Un patient ne peut enregistrer des données que pour lui-même."
            )
    
    # Vérifier si le patient existe réellement
    patient_exists = crud.lire_patient_par_id(db, patient_id)
    if not patient_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

    try:
        nouvelles_donnees = crud.creer_wearable_data(db, data)
        if not nouvelles_donnees:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Données d'appareil connecté non enregistrées.")
        return nouvelles_donnees
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement des données d'appareil connecté pour patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

@patient_router.get(
    "/{patient_id}/wearable_data",
    response_model=List[WearableDataEnDB],
    summary="Lister les données d'appareils connectés d'un patient",
    description="Liste toutes les données d'appareils connectés pour un patient spécifique. Nécessite un rôle 'admin' ou être le patient concerné."
)
async def lire_wearable_data_api(
    patient_id: int,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    limite: int = 100,
    decalage: int = 0,
    type_donnee: Optional[str] = None,
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Liste les données d'appareil connecté d'un patient.
    """
    # Vérifier que le patient_id correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient":
        patient_profile = crud.lire_patient_par_user_id(db, current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Un patient ne peut consulter que ses propres données d'appareil connecté."
            )
    
    # Vérifier si le patient existe réellement
    patient_exists = crud.lire_patient_par_id(db, patient_id)
    if not patient_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

    try:
        data = crud.lire_wearable_data_par_patient(db, patient_id, limite, decalage, type_donnee)
        return data
    except Exception as e:
        logger.error(f"Erreur lors de la lecture des données d'appareil connecté pour patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

# --- Endpoints pour les Rapports Médicaux (lecture seule pour les patients) ---

@patient_router.get(
    "/{patient_id}/medical_reports",
    response_model=List[MedicalReportEnDB],
    summary="Lister les rapports médicaux d'un patient",
    description="Liste tous les rapports médicaux pour un patient spécifique. Nécessite un rôle 'admin' ou être le patient concerné."
)
async def lire_medical_reports_patient_api(
    patient_id: int,
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    limite: int = 100,
    decalage: int = 0,
    current_user: UserEnDB = Depends(get_current_active_user) # Utilisateur authentifié
):
    """
    Liste les rapports médicaux d'un patient.
    """
    # Vérifier que le patient_id correspond à l'utilisateur actuel s'il est un patient
    if current_user.role == "patient":
        patient_profile = crud.lire_patient_par_user_id(db, current_user.id)
        if not patient_profile or patient_profile.id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Un patient ne peut consulter que ses propres rapports médicaux."
            )
    
    # Vérifier si le patient existe réellement
    patient_exists = crud.lire_patient_par_id(db, patient_id)
    if not patient_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient non trouvé.")

    try:
        reports = crud.lire_medical_reports_par_patient(db, patient_id, limite, decalage)
        return reports
    except Exception as e:
        logger.error(f"Erreur lors de la lecture des rapports médicaux pour patient {patient_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur interne du serveur: {e}")

# --- Endpoints pour le chat IA patient ---

@patient_router.post(
    "/chat",
    summary="Chat IA patient (authentification requise)",
    response_model=Dict[str, Any],
    description="Envoie un message au chatbot IA pour le patient authentifié. Nécessite un token Firebase."
)
async def chat_ia_patient(
    message: Dict[str, str],
    db: mysql.connector.MySQLConnection = Depends(obtenir_connexion_db),
    current_user: UserEnDB = Depends(get_current_active_user),
    patient_manager: GestionnairePatient = Depends(get_gestionnaire_patient)
):
    """
    Endpoint de chat IA pour le patient. Nécessite authentification Firebase.
    - **message**: texte envoyé par le patient
    - **reponse**: réponse générée par l'IA
    """
    try:
        question = message.get("message", "")
        if not question:
            raise HTTPException(status_code=400, detail="Message vide.")
        reponse_ia = f"Bonjour {current_user.email}, vous avez demandé : {question} (réponse IA simulée)"
        return {"reponse": reponse_ia}
    except Exception as e:
        logger.error(f"Erreur chat IA patient: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erreur interne du chat IA.")

