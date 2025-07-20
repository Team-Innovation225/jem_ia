import React, { useState } from 'react';
import { User, Stethoscope, Building2, Sun, Moon, Heart, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Ajoute cet import
import AuthPage from './AuthPage'; // Assure-toi que ce fichier existe et est bien importé

const SanteAIHomepage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate(); // Ajoute ceci

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const userTypes = [
    {
      id: 'patient',
      title: 'Espace Patient',
      icon: <User size={48} />,
      description: 'Accédez à vos consultations, dossiers médicaux et prenez rendez-vous',
      color: '#4A90E2'
    },
    {
      id: 'medecin',
      title: 'Espace Médecin',
      icon: <Stethoscope size={48} />,
      description: 'Gérez vos patients, consultations et outils de diagnostic',
      color: '#27AE60'
    },
    {
      id: 'structure',
      title: 'Espace Structure',
      icon: <Building2 size={48} />,
      description: 'Administration, gestion des équipes et statistiques',
      color: '#8E44AD'
    }
  ];

  const features = [
    {
      icon: <Heart size={24} />,
      title: 'Soins personnalisés',
      description: 'Intelligence artificielle au service de votre santé'
    },
    {
      icon: <Shield size={24} />,
      title: 'Données sécurisées',
      description: 'Protection maximale de vos informations médicales'
    },
    {
      icon: <Users size={24} />,
      title: 'Collaboration',
      description: 'Connecter patients, médecins et structures de santé'
    }
  ];

  const teamMembers = [
    {
      name: 'Diomande Kewe Mickael',
      role: 'étuiant en génie logiciel',
      description: '',
      color: '#4A90E2'
    },
    {
      name: 'Nguessan Moaye Jemima',
      role: 'étudiante en génie logiciel',
      description: '',
      color: '#27AE60'
    },
    {
      name: 'Djeke Koffi Kan Christ David',
      role: 'étudiant en génie logiciel',
      description: '',
      color: '#8E44AD'
    },
    {
      name: 'Frejus Kouadio',
      role: 'etudiant en génie logiciel',
      description: '',
      color: '#E67E22'
    }
  ];

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <div className="logo">
              <Heart size={32} />
              <span>SantéAI</span>
            </div>
          </div>
          <nav className="nav-menu">
            <a href="#apropos">À propos</a>
            <a href="#contact">Contact</a>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-icon">
              <Heart size={48} />
            </div>
            <h1 className="hero-title">
              Bienvenue sur <span className="brand-gradient">SantéAI</span>
              <span className="subtitle">La santé connectée pour tous</span>
            </h1>
            <p className="hero-description">
              Une plateforme innovante qui révolutionne l'accès aux soins de santé en Afrique 
              grâce à l'intelligence artificielle et la collaboration entre tous les acteurs de santé.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary-large">Découvrir la plateforme</button>
              <button className="btn btn-secondary-large">En savoir plus</button>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Cards */}
      <section className="user-types">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choisissez votre espace</h2>
            <p className="section-subtitle">Accédez à votre environnement personnalisé selon votre profil</p>
          </div>
          <div className="cards-grid">
            {userTypes.map((userType, index) => (
              <div
                key={userType.id}
                className="user-card"
                style={{
                  '--card-color': userType.color,
                  '--animation-delay': `${index * 0.1}s`
                }}
              >
                <div className="card-top-bar"></div>
                <div className="card-icon">
                  <div className="icon-background"></div>
                  <div className="icon-content">
                    {userType.icon}
                  </div>
                </div>
                <h3 className="card-title">{userType.title}</h3>
                <p className="card-description">{userType.description}</p>
                <div className="card-actions">
                  <span
                    style={{
                      fontSize: "2rem",
                      color: userType.color,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => {
                      if (userType.id === 'patient') navigate('/auth');
                      if (userType.id === 'medecin') navigate('/medecin');
                      if (userType.id === 'structure') navigate('/registerStruct'); // <-- modifie ici
                    }}
                    title="Découvrir"
                  >
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animation et affichage AuthPage */}
      {showAuth && (
        <div className="auth-slide-in">
          <AuthPage onClose={() => setShowAuth(false)} />
        </div>
      )}

      {/* Features Section */}
      <section className="features">
        <div className="features-background"></div>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Pourquoi choisir SantéAI ?</h2>
            <p className="section-subtitle">Des fonctionnalités innovantes pour une expérience de santé exceptionnelle</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{'--animation-delay': `${index * 0.1}s`}}>
                <div className="feature-icon">
                  <div className="feature-icon-circle">
                    {feature.icon}
                  </div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Notre équipe</h2>
            <p className="section-subtitle">des visionnaires passionnés qui révolutionnent la santé en Afrique grâce à l'innovation et l'engagement</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card" style={{'--team-color': member.color, '--animation-delay': `${index * 0.1}s`}}>
                <div className="team-card-top-bar"></div>
                <div className="team-avatar">
                  <div className="avatar-pulse"></div>
                  <div className="avatar-content">
                    <User size={40} />
                  </div>
                  <div className="status-indicator"></div>
                </div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
                <div className="team-contact">
                  <button className="btn-contact">Contacter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-circle">
                  <Heart size={28} />
                </div>
                <span>SantéAI</span>
              </div>
              <p>Révolutionner la santé en Afrique grâce à l'innovation technologique et l'intelligence artificielle.</p>
              <div className="social-links">
                <div className="social-link facebook">f</div>
                <div className="social-link twitter">t</div>
                <div className="social-link linkedin">in</div>
              </div>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Plateformes</h4>
                <a href="#patient">Espace Patient</a>
                <a href="#medecin">Espace Médecin</a>
                <a href="#structure">Espace Structure</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="#aide">Centre d'aide</a>
                <a href="#contact">Contact</a>
                <a href="#confidentialite">Confidentialité</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SantéAI. Tous droits réservés.</p>
            <div className="footer-legal">
              <a href="#mentions">Mentions légales</a>
              <a href="#cgv">CGV</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
          transition: all 0.3s ease;
        }

        .light-theme {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #e2e8f0;
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
          --text-muted: #718096;
          --border-color: #e2e8f0;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .dark-theme {
          --bg-primary: #1a202c;
          --bg-secondary: #2d3748;
          --bg-tertiary: #4a5568;
          --text-primary: #f7fafc;
          --text-secondary: #e2e8f0;
          --text-muted: #a0aec0;
          --border-color: #4a5568;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .header {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4A90E2;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-menu a {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-menu a:hover {
          color: #4A90E2;
        }

        .theme-toggle {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: var(--bg-tertiary);
          transform: scale(1.05);
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .hero-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #4A90E2 0%, #27AE60 50%, #8E44AD 100%);
          opacity: 0.1;
        }

        .dark-theme .hero-gradient {
          opacity: 0.2;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-primary);
          opacity: 0.9;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
          padding: 5rem 0;
          animation: fadeInUp 1s ease-out;
        }

        .hero-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: #4A90E2;
          border-radius: 50%;
          margin-bottom: 2rem;
          color: white;
          box-shadow: var(--shadow-lg);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          line-height: 1.2;
        }

        .brand-gradient {
          background: linear-gradient(135deg, #4A90E2, #27AE60);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 2rem;
          font-weight: 400;
          color: #4A90E2;
          margin-top: 1rem;
        }

        .hero-description {
          font-size: 1.4rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 1rem;
          display: inline-block;
        }

        .btn-primary-large, .btn-secondary-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .btn-primary, .btn-primary-large {
          background: var(--card-color, #4A90E2);
          color: white;
          box-shadow: var(--shadow);
        }

        .btn-primary:hover, .btn-primary-large:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary, .btn-secondary-large {
          background: transparent;
          color: var(--card-color, #4A90E2);
          border: 2px solid var(--card-color, #4A90E2);
        }

        .btn-secondary:hover, .btn-secondary-large:hover {
          background: var(--card-color, #4A90E2);
          color: white;
          transform: translateY(-2px);
        }

        /* Section Headers */
        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        /* User Types Section */
        .user-types {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .user-card {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          transition: all 0.5s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
          animation-delay: var(--animation-delay);
          animation-fill-mode: both;
        }

        .card-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-color);
          transition: height 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-12px);
          box-shadow: var(--shadow-xl);
          border-color: var(--card-color);
        }

        .user-card:hover .card-top-bar {
          height: 8px;
        }

        .card-icon {
          position: relative;
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .icon-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--card-color);
          opacity: 0.1;
          transition: all 0.3s ease;
        }

        .user-card:hover .icon-background {
          opacity: 0.2;
          transform: translate(-50%, -50%) scale(1.1);
        }

        .icon-content {
          position: relative;
          z-index: 2;
          color: var(--card-color);
          padding: 1rem;
        }

        .card-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .card-description {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .card-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Features Section */
        .features {
          padding: 6rem 0;
          position: relative;
          overflow: hidden;
        }

        .features-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(39, 174, 96, 0.05) 100%);
        }

        .dark-theme .features-background {
          background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(39, 174, 96, 0.1) 100%);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          text-align: center;
          padding: 2.5rem 2rem;
          border-radius: 20px;
          background: var(--bg-primary);
          backdrop-filter: blur(10px);
          box-shadow: var(--shadow-lg);
          transition: all 0.4s ease;
          animation: fadeInUp 0.6s ease-out;
          animation-delay: var(--animation-delay);
          animation-fill-mode: both;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }

        .feature-icon {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .feature-icon-circle {
          width: 80px;
          height: 80px;
          background: #4A90E2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon-circle {
          transform: scale(1.1);
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 1.1rem;
        }

        /* Team Section */
        .team {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .team-card {
          background: var(--bg-primary);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          transition: all 0.5s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
          animation-delay: var(--animation-delay);
          animation-fill-mode: both;
        }

        .team-card-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--team-color);
          transition: height 0.3s ease;
        }

        .team-card:hover {
          transform: translateY(-12px);
          box-shadow: var(--shadow-xl);
          border-color: var(--team-color);
        }

        .team-card:hover .team-card-top-bar {
          height: 8px;
        }

        .team-avatar {
          position: relative;
          margin: 0 auto 2rem;
          width: 100px;
          height: 100px;
        }

        .avatar-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background: var(--team-color);
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        .avatar-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--team-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: transform 0.3s ease;
        }

        .team-card:hover .avatar-content {
          transform: scale(1.1);
        }

        .status-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--team-color);
          border: 4px solid var(--bg-primary);
          box-shadow: var(--shadow);
        }

        .team-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .team-role {
          font-size: 1rem;
          font-weight: 600;
          color: var(--team-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          background: rgba(0,0,0,0.05);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-block;
        }

        .dark-theme .team-role {
          background: rgba(255,255,255,0.1);
        }

        .team-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        }

        .team-contact {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .team-card:hover .team-contact {
          opacity: 1;
        }

        .btn-contact {
          padding: 0.5rem 1.5rem;
          border: 2px solid var(--team-color);
          background: transparent;
          color: var(--team-color);
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-contact:hover {
          background: var(--team-color);
          color: white;
          transform: scale(1.05);
        }

        /* Footer */
        .footer {
          background: var(--bg-primary);
          border-top: 1px solid var(--border-color);
          padding: 4rem 0 2rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          max-width: 400px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .logo-circle {
          width: 50px;
          height: 50px;
          background: #4A90E2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .footer-logo span {
          font-size: 1.8rem;
          font-weight: 700;
          color: #4A90E2;
        }

        .footer-brand p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .facebook {
          background: #4A90E2;
        }

        .twitter {
          background: #27AE60;
        }

        .linkedin {
          background: #8E44AD;
        }

        .social-link:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }

        .footer-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .link-group h4 {
          color: var(--text-primary);
          font-weight: 700;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }

        .link-group a {
          display: block;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 0.8rem;
          transition: color 0.3s ease;
          font-size: 1rem;
        }

        .link-group a:hover {
          color: #4A90E2;
          transform: translateX(5px);
        }

        .footer-bottom {
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-bottom p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .footer-legal {
          display: flex;
          gap: 2rem;
        }

        .footer-legal a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-legal a:hover {
          color: #4A90E2;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 3rem;
          }
          
          .subtitle {
            font-size: 1.8rem;
          }
          
          .section-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }

          .nav-menu a {
            display: none;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1.5rem;
          }

          .hero-description {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-actions .btn {
            width: 100%;
            max-width: 300px;
          }

          .card-actions {
            flex-direction: column;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .user-types,
          .features,
          .team {
            padding: 4rem 0;
          }

          .hero-content {
            padding: 3rem 0;
          }

          .team-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .user-card,
          .team-card,
          .feature-card {
            padding: 1.5rem;
          }

          .hero-icon {
            width: 60px;
            height: 60px;
          }

          .hero-icon svg {
            width: 32px;
            height: 32px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .team-avatar {
            width: 80px;
            height: 80px;
          }

          .avatar-content svg {
            width: 32px;
            height: 32px;
          }

          .hero-content {
            padding: 2rem 0;
          }
        }

        /* Hover effects for better interactivity */
        .user-card,
        .team-card,
        .feature-card {
          cursor: pointer;
        }

        .user-card:hover .icon-content,
        .team-card:hover .avatar-content {
          animation: pulse 1s ease-in-out;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Focus states for accessibility */
        .btn:focus,
        .theme-toggle:focus,
        .btn-contact:focus {
          outline: 2px solid #4A90E2;
          outline-offset: 2px;
        }

        /* Loading state animations */
        .user-card,
        .team-card,
        .feature-card {
          transform: translateY(20px);
          opacity: 0;
        }

        .user-card.animate,
        .team-card.animate,
        .feature-card.animate {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .auth-slide-in {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background: rgba(0,0,0,0.08);
          animation: slideInLeft 0.5s cubic-bezier(.77,0,.18,1) forwards;
          display: flex;
          align-items: stretch;
          justify-content: flex-start;
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100vw);
            opacity: 0.2;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SanteAIHomepage;