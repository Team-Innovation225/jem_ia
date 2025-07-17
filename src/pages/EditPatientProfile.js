// src/pages/EditPatientProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaTimes, FaCamera } from 'react-icons/fa';

// --- CORRECTION : Importation statique depuis le bon chemin ---
import { getPatientProfile, updatePatientProfile } from '../services/api';

// Styles basiques psour le formulaire
const formStyles = {
  container: {
    padding: '2.5rem 2rem',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 4px 20px rgba(46, 125, 255, 0.08)',
    maxWidth: '700px',
    margin: '3rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e0eafc',
    paddingBottom: '1rem',
  },
  title: {
    color: '#2e7dff',
    fontSize: '1.8rem',
    fontWeight: 700,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '1.8rem',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  label: {
    fontWeight: 600,
    color: '#333',
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.9rem 1.1rem',
    border: '1px solid #e0eafc',
    borderRadius: '10px',
    fontSize: '1rem',
    color: '#222',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  fileInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  fileInputLabel: {
    background: '#e0eafc',
    color: '#2e7dff',
    padding: '0.8rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    boxShadow: '0 2px 8px rgba(46,125,255,0.08)',
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  imagePreview: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e0eafc',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #f0f0f0',
  },
  button: {
    padding: '0.9rem 2rem',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 700,
    fontSize: '1.05rem',
    cursor: 'pointer',
    transition: 'background 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  saveButton: {
    background: '#2e7dff',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(46, 125, 255, 0.25)',
  },
  cancelButton: {
    background: '#f7f7f8',
    color: '#64748b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  error: {
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  success: {
    color: '#38a169',
    textAlign: 'center',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  disabledButton: { // Style pour bouton désactivé
    opacity: 0.6,
    cursor: 'not-allowed',
  }
};


export default function EditPatientProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    genre: '',
    numero_telephone: '',
    courriel: '',
    mini_biographie: '',
    chemin_photo_profil: '',
    photo_file: null,
    quartier: '',
    ville: '',
    pays: '',
    boite_postale: '',
    groupe_sanguin: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Nouvel état de chargement
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState('');

  // Initialisation du formulaire avec les données passées par la navigation
  useEffect(() => {
    if (location.state?.patientProfile) {
      const patientData = location.state.patientProfile;
      setFormData({
        nom: patientData.nom || '',
        prenom: patientData.prenom || '',
        date_naissance: patientData.date_naissance || '',
        genre: patientData.sexe || '', // Mappage de 'sexe' à 'genre'
        numero_telephone: patientData.telephone || '', // Mappage de 'telephone' à 'numero_telephone'
        courriel: patientData.email || '',
        mini_biographie: patientData.notes || '', // Mappage de 'notes' à 'mini_biographie'
        chemin_photo_profil: patientData.photo || '',
        photo_file: null, // Pas de fichier au chargement initial
        quartier: patientData.quartier || '',
        ville: patientData.ville || '',
        pays: patientData.pays || '',
        boite_postale: patientData.boite_postale || '',
        groupe_sanguin: patientData.groupe_sanguin || '',
      });
      setCurrentPhotoPreview(patientData.photo || '');
    } else {
        // Optionnel: Si aucune donnée n'est passée, essayer de récupérer via UID si disponible
        const userUid = localStorage.getItem('userUid');
        const idToken = localStorage.getItem('firebaseIdToken');
        if (userUid && idToken) {
            setLoading(true);
            getPatientProfile(userUid, idToken)
                .then(patientData => {
                    setFormData({
                        nom: patientData.nom || '',
                        prenom: patientData.prenom || '',
                        date_naissance: patientData.date_naissance || '',
                        genre: patientData.sexe || '',
                        numero_telephone: patientData.telephone || '',
                        courriel: patientData.email || '',
                        mini_biographie: patientData.notes || '',
                        chemin_photo_profil: patientData.photo || '',
                        photo_file: null,
                        quartier: patientData.quartier || '',
                        ville: patientData.ville || '',
                        pays: patientData.pays || '',
                        boite_postale: patientData.boite_postale || '',
                        groupe_sanguin: patientData.groupe_sanguin || '',
                    });
                    setCurrentPhotoPreview(patientData.photo || '');
                })
                .catch(err => {
                    console.error("Erreur de récupération du profil:", err);
                    setError("Impossible de charger le profil pour édition.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }
  }, [location.state?.patientProfile]); // Dépendance à location.state.patientProfile

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo_file: file }));
      setCurrentPhotoPreview(URL.createObjectURL(file));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Active le chargement

    const idToken = localStorage.getItem('firebaseIdToken');
    const userUid = localStorage.getItem('userUid');

    if (!idToken || !userUid) {
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    const dataToUpdate = new FormData();
    for (const key in formData) {
      if (key !== 'photo_file' && key !== 'chemin_photo_profil') {
        dataToUpdate.append(key, formData[key]);
      }
    }
    if (formData.photo_file) {
      dataToUpdate.append('photo_profil', formData.photo_file);
    }
    // Si la photo existante est vide et qu'il n'y a pas de nouvelle photo, on peut envoyer une chaîne vide
    // pour indiquer au backend de supprimer/réinitialiser l'image si elle était présente.
    // Mais cela dépend de votre logique backend. Par défaut, si photo_file est null et chemin_photo_profil
    // n'est pas modifié, la photo existante reste.
    // Si vous voulez une logique de suppression explicite, il faudrait un bouton "supprimer photo".

    try {
      const updatedPatient = await updatePatientProfile(userUid, dataToUpdate, idToken);

      if (updatedPatient.error) {
        setError(updatedPatient.error); // Gérer les erreurs spécifiques renvoyées par l'API
        return;
      }

      setSuccess("Profil mis à jour avec succès !");

      // Attendre un court instant pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        navigate('/patient', { state: { patientProfile: updatedPatient } });
      }, 1500); // Redirige après 1.5 secondes

    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      // Tenter de parser les erreurs du serveur si elles sont au format JSON
      let errorMessage = "Impossible de mettre à jour le profil. Erreur réseau ou serveur.";
      if (err.response && err.response.data) {
          errorMessage = err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false); // Désactive le chargement
    }
  };


  return (
    <div style={formStyles.container}>
      <div style={formStyles.header}>
        <h2 style={formStyles.title}>Modifier mon profil</h2>
        <button style={formStyles.closeButton} onClick={() => navigate('/patient')}>
          <FaTimes />
        </button>
      </div>

      {loading && <div style={formStyles.success}>Enregistrement en cours...</div>} {/* Message de chargement */}
      {error && <div style={formStyles.error}>{error}</div>}
      {success && <div style={formStyles.success}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={formStyles.formGrid}>
          {/* Nom et Prénom */}
          <div style={formStyles.formGroup}>
            <label htmlFor="nom" style={formStyles.label}>Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              style={formStyles.input}
              required
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="prenom" style={formStyles.label}>Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              style={formStyles.input}
              required
            />
          </div>

          {/* Date de Naissance et Genre */}
          <div style={formStyles.formGroup}>
            <label htmlFor="date_naissance" style={formStyles.label}>Date de Naissance</label>
            <input
              type="date"
              id="date_naissance"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={handleChange}
              style={formStyles.input}
              required
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="genre" style={formStyles.label}>Sexe</label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              style={formStyles.input}
              required
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="A">Autre</option>
            </select>
          </div>

          {/* Téléphone et Email (email est en lecture seule car géré par Firebase) */}
          <div style={formStyles.formGroup}>
            <label htmlFor="numero_telephone" style={formStyles.label}>Téléphone</label>
            <input
              type="tel"
              id="numero_telephone"
              name="numero_telephone"
              value={formData.numero_telephone}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="courriel" style={formStyles.label}>Email</label>
            <input
              type="email"
              id="courriel"
              name="courriel"
              value={formData.courriel}
              style={formStyles.input}
              readOnly
              disabled // Rendre le champ non modifiable et sa valeur non envoyable au backend
            />
          </div>

          {/* Groupe Sanguin */}
          <div style={formStyles.formGroup}>
            <label htmlFor="groupe_sanguin" style={formStyles.label}>Groupe Sanguin</label>
            <select
              id="groupe_sanguin"
              name="groupe_sanguin"
              value={formData.groupe_sanguin}
              onChange={handleChange}
              style={formStyles.input}
            >
              <option value="">Non renseigné</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Adresse */}
          <div style={formStyles.formGroup}>
            <label htmlFor="quartier" style={formStyles.label}>Quartier</label>
            <input
              type="text"
              id="quartier"
              name="quartier"
              value={formData.quartier}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="ville" style={formStyles.label}>Ville</label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="pays" style={formStyles.label}>Pays</label>
            <input
              type="text"
              id="pays"
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>
          <div style={formStyles.formGroup}>
            <label htmlFor="boite_postale" style={formStyles.label}>Boîte Postale</label>
            <input
              type="text"
              id="boite_postale"
              name="boite_postale"
              value={formData.boite_postale}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>

          {/* Mini Biographie / Notes */}
          <div style={{ ...formStyles.formGroup, gridColumn: '1 / -1' }}>
            <label htmlFor="mini_biographie" style={formStyles.label}>Notes / Mini Biographie</label>
            <textarea
              id="mini_biographie"
              name="mini_biographie"
              value={formData.mini_biographie}
              onChange={handleChange}
              style={{ ...formStyles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          {/* Photo de Profil */}
          <div style={{ ...formStyles.formGroup, gridColumn: '1 / -1' }}>
            <label style={formStyles.label}>Photo de Profil</label>
            <div style={formStyles.fileInputContainer}>
              {currentPhotoPreview && (
                <img src={currentPhotoPreview} alt="Aperçu" style={formStyles.imagePreview} />
              )}
              <label htmlFor="photo_file" style={formStyles.fileInputLabel}>
                <FaCamera /> Choisir une photo
              </label>
              <input
                type="file"
                id="photo_file"
                name="photo_file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={formStyles.buttonGroup}>
          <button type="button" onClick={() => navigate('/patient')} style={{ ...formStyles.button, ...formStyles.cancelButton }}>
            <FaTimes /> Annuler
          </button>
          <button
            type="submit"
            style={{ ...formStyles.button, ...formStyles.saveButton, ...(loading ? formStyles.disabledButton : {}) }}
            disabled={loading} // Désactiver le bouton pendant le chargement
          >
            <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}