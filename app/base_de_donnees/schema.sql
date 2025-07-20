

USE ia_medicale; 

-- Désactiver temporairement les vérifications de clés étrangères pour faciliter l'ordre de création/modification
SET FOREIGN_KEY_CHECKS = 0;


-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hache VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('patient', 'medecin', 'structure_medicale', 'admin') NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    est_actif BOOLEAN DEFAULT TRUE,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: patients
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    date_naissance DATE NOT NULL,
    sexe VARCHAR(50) NOT NULL,
    adresse VARCHAR(255),
    telephone VARCHAR(50),
    groupe_sanguin VARCHAR(10),
    antecedents_medicaux JSON, -- Stocke une liste de chaînes JSON (e.g., ["diabète", "hypertension"])
    allergies JSON, -- Stocke une liste de chaînes JSON (e.g., ["pénicilline", "arachides"])
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: doctors
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialite VARCHAR(100) NOT NULL,
    numero_licence VARCHAR(100) UNIQUE NOT NULL,
    experience_annees INT,
    coordonnees_gps VARCHAR(50), -- "latitude,longitude"
    adresse_cabinet VARCHAR(255),
    telephone_cabinet VARCHAR(50),
    disponibilites_json JSON, -- Stocke les disponibilités au format JSON (e.g., {"lundi": ["09:00-12:00"]})
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: medical_structures
CREATE TABLE IF NOT EXISTS medical_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    nom_structure VARCHAR(255) NOT NULL,
    type_structure VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    coordonnees_gps VARCHAR(50), -- "latitude,longitude"
    telephone VARCHAR(50),
    heures_ouverture_json JSON, -- Stocke les heures d'ouverture au format JSON (e.g., {"lundi": "08:00-18:00"})
    services_offerts JSON, -- Stocke une liste de services JSON (e.g., ["consultation_generale", "radiologie"])
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: appointments
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    date_heure_debut DATETIME NOT NULL,
    date_heure_fin DATETIME NOT NULL,
    raison TEXT NOT NULL,
    statut ENUM('planifie', 'confirme', 'annule', 'termine') NOT NULL DEFAULT 'planifie',
    notes_patient TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: wearable_data
CREATE TABLE IF NOT EXISTS wearable_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    type_donnee VARCHAR(100) NOT NULL,
    valeur DECIMAL(10, 2) NOT NULL,
    unite VARCHAR(50) NOT NULL,
    horodatage TIMESTAMP NOT NULL,
    source VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: health_status_logs
CREATE TABLE IF NOT EXISTS health_status_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    date_log DATE NOT NULL,
    symptomes_rapportes JSON, -- Liste de symptômes rapportés par le patient
    gravite_generale INT,
    notes_patient TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: teleconsultation_sessions
CREATE TABLE IF NOT EXISTS teleconsultation_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNIQUE NOT NULL,
    url_session VARCHAR(255) NOT NULL,
    horodatage_debut DATETIME NOT NULL,
    horodatage_fin DATETIME,
    statut ENUM('en_attente', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'en_attente',
    transcription_texte TEXT,
    resume_ia TEXT,
    notes_medecin TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Table: medical_reports
CREATE TABLE IF NOT EXISTS medical_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    date_rapport DATETIME NOT NULL,
    type_rapport VARCHAR(100) NOT NULL,
    contenu_markdown LONGTEXT NOT NULL,
    resume_ia TEXT,
    statut ENUM('brouillon', 'finalise', 'archive') NOT NULL DEFAULT 'brouillon',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Table: consultation_modules
CREATE TABLE IF NOT EXISTS consultation_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    structure_json JSON NOT NULL,
    est_public BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: resources
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    structure_id INT NOT NULL,
    nom_ressource VARCHAR(255) NOT NULL,
    type_ressource VARCHAR(100) NOT NULL,
    description TEXT,
    capacite INT,
    disponibilites_json JSON,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (structure_id) REFERENCES medical_structures(id) ON DELETE CASCADE
);

-- Table: statistic_reports
CREATE TABLE IF NOT EXISTS statistic_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    structure_id INT NOT NULL,
    date_generation DATETIME NOT NULL,
    type_rapport VARCHAR(100) NOT NULL,
    donnees_json JSON NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (structure_id) REFERENCES medical_structures(id) ON DELETE CASCADE
);


-- --- MISE À JOUR DES TABLES EXISTANTES ---

-- Table: maladies
-- Ajout de colonnes si elles n'existent pas
ALTER TABLE maladies
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;





ALTER TABLE symptomes
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


ALTER TABLE conversation_logs
ADD COLUMN IF NOT EXISTS date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;





ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS horodatage TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE feedback
ADD CONSTRAINT fk_feedback_message_id
FOREIGN KEY (message_id) REFERENCES conversation_logs(id) ON DELETE CASCADE;



ALTER TABLE maladie_symptome_liens
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


ALTER TABLE users ADD INDEX IF NOT EXISTS idx_email (email);
ALTER TABLE patients ADD INDEX IF NOT EXISTS idx_user_id_patient (user_id);
ALTER TABLE doctors ADD INDEX IF NOT EXISTS idx_user_id_doctor (user_id);
ALTER TABLE medical_structures ADD INDEX IF NOT EXISTS idx_user_id_structure (user_id);
ALTER TABLE maladies ADD INDEX IF NOT EXISTS idx_nom_fr_maladie (nom_fr);
ALTER TABLE maladies ADD INDEX IF NOT EXISTS idx_code_cim_10 (code_cim_10);
ALTER TABLE symptomes ADD INDEX IF NOT EXISTS idx_nom_fr_symptome (nom_fr);
ALTER TABLE maladie_symptome_liens ADD INDEX IF NOT EXISTS idx_id_maladie (id_maladie);
ALTER TABLE maladie_symptome_liens ADD INDEX IF NOT EXISTS idx_id_symptome (id_symptome);
ALTER TABLE conversation_logs ADD INDEX IF NOT EXISTS idx_id_session (id_session);
ALTER TABLE conversation_logs ADD INDEX IF NOT EXISTS idx_horodatage (horodatage);
ALTER TABLE feedbacks ADD INDEX IF NOT EXISTS idx_message_id (message_id);
ALTER TABLE feedbacks ADD INDEX IF NOT EXISTS idx_id_session_feedback (id_session);
ALTER TABLE appointments ADD INDEX IF NOT EXISTS idx_patient_id_appt (patient_id);
ALTER TABLE appointments ADD INDEX IF NOT EXISTS idx_doctor_id_appt (doctor_id);
ALTER TABLE appointments ADD INDEX IF NOT EXISTS idx_date_heure_debut (date_heure_debut);
ALTER TABLE wearable_data ADD INDEX IF NOT EXISTS idx_patient_id_wearable (patient_id);
ALTER TABLE wearable_data ADD INDEX IF NOT EXISTS idx_horodatage_wearable (horodatage);
ALTER TABLE health_status_logs ADD INDEX IF NOT EXISTS idx_patient_id_health (patient_id);
ALTER TABLE health_status_logs ADD INDEX IF NOT EXISTS idx_date_log (date_log);
ALTER TABLE teleconsultation_sessions ADD INDEX IF NOT EXISTS idx_appointment_id_teleconsult (appointment_id);
ALTER TABLE medical_reports ADD INDEX IF NOT EXISTS idx_patient_id_report (patient_id);
ALTER TABLE medical_reports ADD INDEX IF NOT EXISTS idx_doctor_id_report (doctor_id);
ALTER TABLE consultation_modules ADD INDEX IF NOT EXISTS idx_doctor_id_module (doctor_id);
ALTER TABLE resources ADD INDEX IF NOT EXISTS idx_structure_id_resource (structure_id);
ALTER TABLE statistic_reports ADD INDEX IF NOT EXISTS idx_structure_id_stats (structure_id);


-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;
