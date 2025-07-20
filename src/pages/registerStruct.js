import React, { useState } from 'react';
import { Building2, MapPin, Phone, User, FileText, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const StructureRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    // Informations générales
    structureName: '',
    structureType: '',
    registrationNumber: '',
    foundedYear: '',
    
    // Localisation
    address: '',
    city: '',
    region: '',
    country: 'Côte d\'Ivoire',
    postalCode: '',
    
    // Contact
    phone: '',
    email: '',
    website: '',
    
    // Responsable
    responsibleFirstName: '',
    responsibleLastName: '',
    responsibleTitle: '',
    responsiblePhone: '',
    responsibleEmail: '',
    
    // Services
    services: [],
    specialties: [],
    capacity: '',
    emergencyServices: false,
    
    // Authentification
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});

  const structureTypes = [
    'Hôpital public',
    'Hôpital privé',
    'Clinique',
    'Centre de santé communautaire',
    'Cabinet médical',
    'Laboratoire d\'analyses',
    'Pharmacie',
    'Centre de radiologie',
    'Maternité',
    'Centre de dialyse',
    'Centre de rééducation',
    'Autre'
  ];

  const availableServices = [
    'Consultation générale',
    'Urgences',
    'Hospitalisation',
    'Chirurgie',
    'Maternité',
    'Pédiatrie',
    'Cardiologie',
    'Neurologie',
    'Radiologie',
    'Laboratoire',
    'Pharmacie',
    'Kinésithérapie',
    'Dentaire',
    'Ophtalmologie',
    'ORL',
    'Dermatologie'
  ];

  const regions = [
    'Abidjan',
    'Bas-Sassandra',
    'Comoé',
    'Denguélé',
    'Gôh-Djiboua',
    'Lacs',
    'Lagunes',
    'Montagnes',
    'Sassandra-Marahoué',
    'Savanes',
    'Vallée du Bandama',
    'Woroba',
    'Yamoussoukro',
    'Zanzan'
  ];

  const steps = [
    { number: 1, title: 'Informations générales', icon: <Building2 size={20} /> },
    { number: 2, title: 'Localisation', icon: <MapPin size={20} /> },
    { number: 3, title: 'Contact & Responsable', icon: <User size={20} /> },
    { number: 4, title: 'Services & Spécialités', icon: <FileText size={20} /> },
    { number: 5, title: 'Finalisation', icon: <CheckCircle size={20} /> }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.structureName.trim()) newErrors.structureName = 'Le nom de la structure est requis';
      if (!formData.structureType) newErrors.structureType = 'Le type de structure est requis';
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Le numéro d\'enregistrement est requis';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise';
      if (!formData.city.trim()) newErrors.city = 'La ville est requise';
      if (!formData.region) newErrors.region = 'La région est requise';
    }

    if (step === 3) {
      if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
      if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
      if (!formData.responsibleFirstName.trim()) newErrors.responsibleFirstName = 'Le prénom du responsable est requis';
      if (!formData.responsibleLastName.trim()) newErrors.responsibleLastName = 'Le nom du responsable est requis';
    }

    if (step === 4) {
      if (formData.services.length === 0) newErrors.services = 'Sélectionnez au moins un service';
    }

    if (step === 5) {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
      if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'Vous devez accepter la politique de confidentialité';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1>Inscription réussie !</h1>
          <p>Votre demande d'inscription a été soumise avec succès. Notre équipe va examiner votre dossier et vous contacter sous 24-48 heures.</p>
          <div className="success-info">
            <h3>Prochaines étapes :</h3>
            <ul>
              <li>Vérification de vos informations</li>
              <li>Validation de votre structure</li>
              <li>Envoi de vos identifiants d'accès</li>
              <li>Formation à l'utilisation de la plateforme</li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Nouvelle inscription
          </button>
        </div>
        <style jsx>{`
          .success-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #4A90E2 0%, #27AE60 100%);
            padding: 2rem;
          }
          .success-content {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .success-icon {
            color: #27AE60;
            margin-bottom: 2rem;
          }
          .success-content h1 {
            color: #1a202c;
            margin-bottom: 1rem;
            font-size: 2rem;
          }
          .success-content p {
            color: #4a5568;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .success-info {
            text-align: left;
            background: #f8fafc;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 2rem;
          }
          .success-info h3 {
            color: #1a202c;
            margin-bottom: 1rem;
          }
          .success-info ul {
            color: #4a5568;
            padding-left: 1.5rem;
          }
          .success-info li {
            margin-bottom: 0.5rem;
          }
          .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-primary {
            background: #4A90E2;
            color: white;
          }
          .btn-primary:hover {
            background: #357abd;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2>Informations générales de la structure</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="structureName">Nom de la structure *</label>
                <input
                  type="text"
                  id="structureName"
                  name="structureName"
                  value={formData.structureName}
                  onChange={handleInputChange}
                  className={errors.structureName ? 'error' : ''}
                  placeholder="Ex: Centre Hospitalier Universitaire de Treichville"
                />
                {errors.structureName && <span className="error-message">{errors.structureName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="structureType">Type de structure *</label>
                <select
                  id="structureType"
                  name="structureType"
                  value={formData.structureType}
                  onChange={handleInputChange}
                  className={errors.structureType ? 'error' : ''}
                >
                  <option value="">Sélectionnez le type</option>
                  {structureTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.structureType && <span className="error-message">{errors.structureType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="registrationNumber">Numéro d'enregistrement *</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className={errors.registrationNumber ? 'error' : ''}
                  placeholder="Ex: CHU-ABJ-2018-001"
                />
                {errors.registrationNumber && <span className="error-message">{errors.registrationNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="foundedYear">Année de création</label>
                <input
                  type="number"
                  id="foundedYear"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Ex: 1995"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2>Localisation de la structure</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address">Adresse complète *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Ex: Boulevard de la République, Quartier Plateau"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="city">Ville *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'error' : ''}
                  placeholder="Ex: Abidjan"
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="region">Région *</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={errors.region ? 'error' : ''}
                >
                  <option value="">Sélectionnez la région</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && <span className="error-message">{errors.region}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="country">Pays</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Code postal</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Ex: 00225"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2>Contact et responsable</h2>
            
            <div className="section">
              <h3><Phone size={20} /> Contact de la structure</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="phone">Téléphone principal *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Ex: +225 01 23 45 67 89"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email principal *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Ex: contact@chu-treichville.ci"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="website">Site web</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="Ex: https://www.chu-treichville.ci"
                  />
                </div>
              </div>
            </div>

            <div className="section">
              <h3><User size={20} /> Responsable de la structure</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="responsibleFirstName">Prénom *</label>
                  <input
                    type="text"
                    id="responsibleFirstName"
                    name="responsibleFirstName"
                    value={formData.responsibleFirstName}
                    onChange={handleInputChange}
                    className={errors.responsibleFirstName ? 'error' : ''}
                    placeholder="Ex: Aminata"
                  />
                  {errors.responsibleFirstName && <span className="error-message">{errors.responsibleFirstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="responsibleLastName">Nom *</label>
                  <input
                    type="text"
                    id="responsibleLastName"
                    name="responsibleLastName"
                    value={formData.responsibleLastName}
                    onChange={handleInputChange}
                    className={errors.responsibleLastName ? 'error' : ''}
                    placeholder="Ex: Kouassi"
                  />
                  {errors.responsibleLastName && <span className="error-message">{errors.responsibleLastName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="responsibleTitle">Fonction</label>
                  <input
                    type="text"
                    id="responsibleTitle"
                    name="responsibleTitle"
                    value={formData.responsibleTitle}
                    onChange={handleInputChange}
                    placeholder="Ex: Directeur Général"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responsiblePhone">Téléphone</label>
                  <input
                    type="tel"
                    id="responsiblePhone"
                    name="responsiblePhone"
                    value={formData.responsiblePhone}
                    onChange={handleInputChange}
                    placeholder="Ex: +225 07 12 34 56 78"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="responsibleEmail">Email</label>
                  <input
                    type="email"
                    id="responsibleEmail"
                    name="responsibleEmail"
                    value={formData.responsibleEmail}
                    onChange={handleInputChange}
                    placeholder="Ex: directeur@chu-treichville.ci"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2>Services et spécialités</h2>
            
            <div className="form-group">
              <label>Services disponibles *</label>
              <div className="checkbox-grid">
                {availableServices.map(service => (
                  <label key={service} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                    />
                    <span className="checkmark"></span>
                    {service}
                  </label>
                ))}
              </div>
              {errors.services && <span className="error-message">{errors.services}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="capacity">Capacité d'accueil (lits)</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Ex: 150"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Services d'urgence 24h/24
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialties">Spécialités particulières</label>
              <textarea
                id="specialties"
                name="specialties"
                value={formData.specialties}
                onChange={handleInputChange}
                rows="4"
                placeholder="Décrivez vos spécialités médicales particulières, équipements spéciaux, certifications..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2>Finalisation de l'inscription</h2>
            
            <div className="section">
              <h3>Création de votre compte</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="password">Mot de passe *</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'error' : ''}
                      placeholder="Au moins 8 caractères"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? 'error' : ''}
                      placeholder="Répétez le mot de passe"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            <div className="section">
              <h3>Acceptation des conditions</h3>
              <div className="terms-section">
                <label className={`checkbox-item ${errors.acceptTerms ? 'error' : ''}`}>
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  J'accepte les <button type="button" className="mon-style-bouton">Texte du lien</button> de SantéAI
                </label>
                {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}

                <label className={`checkbox-item ${errors.acceptPrivacy ? 'error' : ''}`}>
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  J'accepte la <a href="/confidentialite" className="link">politique de confidentialité</a>
                </label>
                {errors.acceptPrivacy && <span className="error-message">{errors.acceptPrivacy}</span>}
              </div>
            </div>

            <div className="summary-section">
              <h3>Récapitulatif</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <strong>Structure:</strong> {formData.structureName}
                </div>
                <div className="summary-item">
                  <strong>Type:</strong> {formData.structureType}
                </div>
                <div className="summary-item">
                  <strong>Localisation:</strong> {formData.city}, {formData.region}
                </div>
                <div className="summary-item">
                  <strong>Contact:</strong> {formData.email}
                </div>
                <div className="summary-item">
                  <strong>Services:</strong> {formData.services.length} service(s) sélectionné(s)
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <div className="logo">
          <Building2 size={32} />
          <span>SantéAI</span>
        </div>
        <h1>Inscription d'une structure de santé</h1>
        <p>Rejoignez notre réseau de structures de santé connectées</p>
      </div>

      <div className="registration-content">
        <div className="steps-sidebar">
          <div className="steps-container">
            {steps.map((step) => (
              <div 
                key={step.number}
                className={`step-item ${step.number === currentStep ? 'active' : ''} ${step.number < currentStep ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {step.number < currentStep ? <CheckCircle size={20} /> : step.icon}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-subtitle">Étape {step.number}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={20} />
                  Précédent
                </button>
              )}
              
              {currentStep < 5 ? (
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Suivant
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Inscription en cours...' : 'Finaliser l\'inscription'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .registration-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .registration-header {
          background: white;
          padding: 2rem 0;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #4A90E2;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .registration-header h1 {
          color: #1a202c;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .registration-header p {
          color: #4a5568;
          font-size: 1.2rem;
        }

        .registration-content {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 140px);
        }

        .steps-sidebar {
          width: 350px;
          background: white;
          padding: 2rem;
          border-right: 1px solid #e2e8f0;
        }

        .steps-container {
          position: sticky;
          top: 2rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .step-item:last-child {
          border-bottom: none;
        }

        .step-item.active {
          background: #f0f9ff;
          margin: 0 -1rem;
          padding: 1.5rem 1rem;
          border-radius: 10px;
          border-bottom: 1px solid transparent;
        }

        .step-item.completed .step-number {
          background: #27AE60;
          color: white;
        }

        .step-number {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #4a5568;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .step-item.active .step-number {
          background: #4A90E2;
          color: white;
          transform: scale(1.1);
        }

        .step-info {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 0.25rem;
        }

        .step-subtitle {
          font-size: 0.9rem;
          color: #718096;
        }

        .form-container {
          flex: 1;
          padding: 2rem;
          background: white;
          margin: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          height: fit-content;
        }

        .step-content h2 {
          color: #1a202c;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section h3 {
          color: #2d3748;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4A90E2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        .password-input {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .password-toggle:hover {
          color: #4A90E2;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          transition: background-color 0.3s ease;
          cursor: pointer;
          font-weight: 500;
          color: #2d3748;
        }

        .checkbox-item:hover {
          background: #f7fafc;
        }

        .checkbox-item input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e0;
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkmark {
          background: #4A90E2;
          border-color: #4A90E2;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkmark::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-item.error {
          border: 1px solid #e53e3e;
          background: #fef5f5;
        }

        .terms-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .link {
          color: #4A90E2;
          text-decoration: none;
          font-weight: 600;
        }

        .link:hover {
          text-decoration: underline;
        }

        .summary-section {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 10px;
          border: 1px solid #bfdbfe;
          margin-top: 2rem;
        }

        .summary-section h3 {
          color: #1e40af;
          margin-bottom: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          color: #1e40af;
          padding: 0.5rem 0;
        }

        .summary-item strong {
          color: #1e3a8a;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4A90E2;
          color: white;
          box-shadow: 0 4px 6px rgba(74, 144, 226, 0.2);
        }

        .btn-primary:hover:not(:disabled) {
          background: #357abd;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(74, 144, 226, 0.3);
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
          border: 1px solid #cbd5e0;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .registration-content {
            flex-direction: column;
          }

          .steps-sidebar {
            width: 100%;
            padding: 1rem;
          }

          .steps-container {
            position: static;
            display: flex;
            overflow-x: auto;
            gap: 1rem;
            padding-bottom: 1rem;
          }

          .step-item {
            flex-direction: column;
            text-align: center;
            min-width: 120px;
            border-bottom: none;
            border-right: 1px solid #f1f5f9;
            padding: 1rem;
          }

          .step-item:last-child {
            border-right: none;
          }

          .step-item.active {
            margin: 0;
            padding: 1rem;
          }

          .step-info {
            margin-top: 0.5rem;
          }

          .step-title {
            font-size: 0.875rem;
          }

          .step-subtitle {
            font-size: 0.75rem;
          }

          .form-container {
            margin: 1rem;
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .registration-header h1 {
            font-size: 2rem;
          }

          .registration-header p {
            font-size: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .checkbox-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .step-content h2 {
            font-size: 1.5rem;
          }

          .steps-container {
            flex-direction: column;
          }

          .step-item {
            flex-direction: row;
            border-right: none;
            border-bottom: 1px solid #f1f5f9;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .registration-header {
            padding: 1rem 0;
          }

          .form-container {
            margin: 0.5rem;
            padding: 1rem;
            border-radius: 10px;
          }

          .registration-header h1 {
            font-size: 1.75rem;
          }

          .step-content h2 {
            font-size: 1.25rem;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StructureRegistrationForm;