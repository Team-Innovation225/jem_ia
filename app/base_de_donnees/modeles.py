# app/base_de_donnees/modeles.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field # <-- Ajout Field pour les descriptions

# --- Modèles d'authentification et d'utilisateur ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreer(UserBase):
    firebase_uid: str # L'ID unique de l'utilisateur Firebase
    role: str # 'patient', 'medecin', 'structure_medicale'

class UserEnDB(UserBase):
    id: int
    firebase_uid: str
    role: str
    est_actif: bool
    date_creation: datetime

    class Config:
        from_attributes = True

class UserRegisterRequest(BaseModel):
    # Pour l'enregistrement Email/Password via le frontend, le backend ne gère pas le mot de passe
    email: EmailStr
    password: str # Le mot de passe sera envoyé à Firebase par le frontend
    role: str # 'patient', 'medecin', 'structure_medicale'

class FirebaseIdTokenRequest(BaseModel):
    id_token: str # Le Firebase ID Token envoyé par le frontend

# --- Modèles de Profils ---
class PatientBase(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    date_naissance: Optional[str] = None
    genre: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None

class PatientCreer(PatientBase):
    user_id: int

class PatientEnDB(PatientBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class PatientMettreAJour(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    date_naissance: Optional[str] = None
    genre: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None

class MedecinBase(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    specialite: Optional[str] = None
    numero_licence: Optional[str] = None
    adresse_cabinet: Optional[str] = None
    telephone_cabinet: Optional[str] = None


class MedecinCreer(MedecinBase):
    user_id: int

class MedecinEnDB(MedecinBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class StructureMedicaleBase(BaseModel):
    nom_structure: Optional[str] = None
    type_structure: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None

class StructureMedicaleCreer(StructureMedicaleBase):
    user_id: int

class StructureMedicaleEnDB(StructureMedicaleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Modèles de Contexte et Log de Conversation ---
class ContexteConversationBase(BaseModel):
    id_session: str
    historique_json: Optional[str] = None # JSON string for conversation history

class ContexteConversationEnDB(ContexteConversationBase):
    id: int
    derniere_mise_a_jour: datetime

    class Config:
        from_attributes = True

class LogConversationBase(BaseModel): # <-- Correction de l'ancien nom ConversationLogBase
    id_session: str
    role: str
    message: str
    type_message: Optional[str] = 'message_utilisateur'
    donnees_structurees: Optional[str] = None # JSON string for structured data

class LogConversationCreer(LogConversationBase): # <-- Correction de l'ancien nom ConversationLogCreer
    pass

class LogConversationEnDB(LogConversationBase): # <-- Correction de l'ancien nom ConversationLogEnDB
    id: int
    horodatage: datetime

    class Config:
        from_attributes = True

# --- NOUVEAUX MODÈLES POUR LES MALADIES ET SYMPTÔMES (pour la base de connaissances) ---
class MaladieBase(BaseModel):
    nom_fr: str
    code_cim_10: Optional[str] = None
    description: Optional[str] = None
    gravite: Optional[int] = Field(None, ge=1, le=5, description="Niveau de gravité (1=léger, 5=critique)")
    prevalence: Optional[str] = None
    recommandation_triage: Optional[str] = Field(None, description="Ex: 'consultation_rapide', 'urgence', 'information_generale'")
    symptomes_courants_mots_cles: List[str] = []
    causes_mots_cles: List[str] = []
    facteurs_risque_mots_cles: List[str] = []

class MaladieCreer(MaladieBase):
    pass

class MaladieMettreAJour(BaseModel):
    nom_fr: Optional[str] = None
    code_cim_10: Optional[str] = None
    description: Optional[str] = None
    gravite: Optional[int] = Field(None, ge=1, le=5)
    prevalence: Optional[str] = None
    recommandation_triage: Optional[str] = None
    symptomes_courants_mots_cles: Optional[List[str]] = None
    causes_mots_cles: Optional[List[str]] = None
    facteurs_risque_mots_cles: Optional[List[str]] = None

class MaladieEnDB(MaladieBase):
    id: int

    class Config:
        from_attributes = True

class SymptomeBase(BaseModel):
    nom_fr: str
    description: Optional[str] = None
    gravite_potentielle: Optional[int] = Field(None, ge=1, le=10, description="Gravité potentielle (1=faible, 10=très élevée)")
    mots_cles_associes: List[str] = []

class SymptomeCreer(SymptomeBase):
    pass

class SymptomeMettreAJour(BaseModel):
    nom_fr: Optional[str] = None
    description: Optional[str] = None
    gravite_potentielle: Optional[int] = Field(None, ge=1, le=10)
    mots_cles_associes: Optional[List[str]] = None

class SymptomeEnDB(SymptomeBase):
    id: int

    class Config:
        from_attributes = True

class MaladieSymptomeLienCreer(BaseModel):
    maladie_id: int
    symptome_id: int
    force_lien: Optional[float] = Field(None, ge=0.0, le=1.0, description="Force du lien (0.0 à 1.0)")

class MaladieSymptomeLienEnDB(MaladieSymptomeLienCreer):
    id: int

    class Config:
        from_attributes = True

# --- Modèles de Rendez-vous ---
class RendezVousBase(BaseModel):
    patient_id: int
    medecin_id: Optional[int] = None
    structure_id: Optional[int] = None
    date_heure: datetime
    motif: Optional[str] = None
    statut: Optional[str] = 'planifie'

class RendezVousCreer(RendezVousBase):
    pass

class RendezVousEnDB(RendezVousBase):
    id: int

    class Config:
        from_attributes = True

class HealthStatusLogBase(BaseModel):
    patient_id: int
    statut: str
    date: datetime
    notes: Optional[str] = None

class HealthStatusLogCreer(HealthStatusLogBase):
    pass

class HealthStatusLogEnDB(HealthStatusLogBase):
    id: int
    class Config:
        from_attributes = True

class WearableDataBase(BaseModel):
    patient_id: int
    type_capteur: str
    valeur: float
    unite: str
    date: datetime

class WearableDataCreer(WearableDataBase):
    pass

class WearableDataEnDB(WearableDataBase):
    id: int
    class Config:
        from_attributes = True

class MedicalReportBase(BaseModel):
    patient_id: int
    medecin_id: int
    date: datetime
    titre: str
    contenu: str
    type_rapport: Optional[str] = None

class MedicalReportCreer(MedicalReportBase):
    pass

class MedicalReportEnDB(MedicalReportBase):
    id: int
    class Config:
        from_attributes = True

class DoctorBase(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    specialite: Optional[str] = None
    numero_licence: Optional[str] = None
    adresse_cabinet: Optional[str] = None
    telephone_cabinet: Optional[str] = None

class DoctorCreer(DoctorBase):
    user_id: int

class DoctorEnDB(DoctorBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class DoctorMettreAJour(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    specialite: Optional[str] = None
    numero_licence: Optional[str] = None
    adresse_cabinet: Optional[str] = None
    telephone_cabinet: Optional[str] = None

class AppointmentBase(BaseModel):
    patient_id: int
    medecin_id: Optional[int] = None
    structure_id: Optional[int] = None
    date_heure: datetime
    motif: Optional[str] = None
    statut: Optional[str] = 'planifie'

class AppointmentCreer(AppointmentBase):
    pass

class AppointmentEnDB(AppointmentBase):
    id: int
    class Config:
        from_attributes = True

class AppointmentMettreAJour(BaseModel):
    patient_id: Optional[int] = None
    medecin_id: Optional[int] = None
    structure_id: Optional[int] = None
    date_heure: Optional[datetime] = None
    motif: Optional[str] = None
    statut: Optional[str] = None

class ConsultationModuleBase(BaseModel):
    patient_id: int
    medecin_id: int
    date: datetime
    motif: Optional[str] = None
    notes: Optional[str] = None

class ConsultationModuleCreer(ConsultationModuleBase):
    pass

class ConsultationModuleEnDB(ConsultationModuleBase):
    id: int
    class Config:
        from_attributes = True

class MedicalStructureBase(BaseModel):
    nom_structure: Optional[str] = None
    type_structure: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None

class MedicalStructureCreer(MedicalStructureBase):
    user_id: int

class MedicalStructureEnDB(MedicalStructureBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class MedicalStructureMettreAJour(BaseModel):
    nom_structure: Optional[str] = None
    type_structure: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None

class ResourceBase(BaseModel):
    nom: str
    type: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None

class ResourceCreer(ResourceBase):
    pass

class ResourceEnDB(ResourceBase):
    id: int
    class Config:
        from_attributes = True

class StatisticReportBase(BaseModel):
    titre: str
    description: Optional[str] = None
    date: datetime
    donnees: Optional[str] = None

class StatisticReportCreer(StatisticReportBase):
    pass

class StatisticReportEnDB(StatisticReportBase):
    id: int
    class Config:
        from_attributes = True

class TeleconsultationSessionBase(BaseModel):
    patient_id: int
    medecin_id: int
    date: datetime
    statut: Optional[str] = None
    notes: Optional[str] = None

class TeleconsultationSessionCreer(TeleconsultationSessionBase):
    pass

class TeleconsultationSessionEnDB(TeleconsultationSessionBase):
    id: int
    class Config:
        from_attributes = True

