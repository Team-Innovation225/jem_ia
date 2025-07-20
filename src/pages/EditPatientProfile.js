// src/pages/EditPatientProfile.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaTimes, FaCamera, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat, FaMagic } from 'react-icons/fa';

// --- CORRECTION : Importation statique depuis le bon chemin ---
import { getPatientProfile, updatePatientProfile } from '../services/api';

// Styles révolutionnaires avec les dernières tendances 2025
const formStyles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 35%, #f093fb 70%, #f5576c 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  
  // Arrière-plan animé avec particules flottantes
  backgroundParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    background: `
      radial-gradient(circle at 15% 25%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
      radial-gradient(circle at 85% 75%, rgba(255, 118, 117, 0.4) 0%, transparent 60%),
      radial-gradient(circle at 50% 10%, rgba(46, 125, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 40%, rgba(245, 87, 108, 0.3) 0%, transparent 50%)
    `,
    animation: 'particleFloat 8s ease-in-out infinite',
  },

  morphingBlob: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'morphing 12s ease-in-out infinite',
    zIndex: 0,
  },

  // Conteneur principal avec Glassmorphism avancé
  container: {
    width: '100%',
    maxWidth: '1200px',
    position: 'relative',
    zIndex: 10,
    animation: 'containerEntrance 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Bento Grid Layout moderne
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'auto auto auto auto',
    gap: '2rem',
    perspective: '1000px',
  },

  // Header avec glassmorphism
  headerCard: {
    gridColumn: '1 / -1',
    gridRow: '1',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
    backdropFilter: 'blur(25px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '32px',
    padding: '3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `
      0 25px 50px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
    animation: 'slideInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
  },

  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'shimmerMove 3s ease-in-out infinite',
  },

  title: {
    fontSize: '3rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #2e7dff, #764ba2, #f093fb)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 0 30px rgba(46, 125, 255, 0.3)',
    animation: 'titleGlow 2s ease-in-out infinite alternate',
    letterSpacing: '-0.02em',
  },

  closeButton: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#2e7dff',
    fontSize: '1.5rem',
    animation: 'buttonFloat 3s ease-in-out infinite',
  },

  // Sections du formulaire avec différentes tailles de bento
  formSectionLarge: {
    gridColumn: 'span 8',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '28px',
    padding: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
  },

  formSectionMedium: {
    gridColumn: 'span 4',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '28px',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
  },

  formSectionSmall: {
    gridColumn: 'span 3',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '28px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
  },

  formSectionFull: {
    gridColumn: '1 / -1',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '28px',
    padding: '2.5rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
  },

  // Effets de hover sur les cartes
  cardHoverEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(46, 125, 255, 0.1), rgba(118, 75, 162, 0.1))',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    borderRadius: '28px',
  },

  // Labels avec icônes animées
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '1.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },

  labelIcon: {
    width: '24px',
    height: '24px',
    background: 'linear-gradient(135deg, #2e7dff, #764ba2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.9rem',
    animation: 'iconPulse 2s ease-in-out infinite',
    boxShadow: '0 4px 15px rgba(46, 125, 255, 0.3)',
  },

  // Input avec effet glassmorphism et animations 3D
  inputContainer: {
    position: 'relative',
    perspective: '1000px',
  },

  input: {
    width: '100%',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.95)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
    fontWeight: 500,
  },

  inputFocused: {
    border: '2px solid rgba(46, 125, 255, 0.6)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
    transform: 'translateY(-3px) rotateX(2deg)',
    boxShadow: `
      0 20px 40px rgba(46, 125, 255, 0.15),
      inset 0 2px 10px rgba(255, 255, 255, 0.1)
    `,
  },

  // Effet de glow morphing autour des inputs
  inputGlow: {
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    background: 'linear-gradient(45deg, #2e7dff, #764ba2, #f093fb, #f5576c)',
    backgroundSize: '400% 400%',
    borderRadius: '24px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    animation: 'gradientShift 4s ease-in-out infinite',
    zIndex: -1,
    filter: 'blur(8px)',
  },

  // Section photo avec animations complexes
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
    position: 'relative',
  },

  photoContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
    backdropFilter: 'blur(20px)',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'photoFloat 4s ease-in-out infinite',
  },

  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    animation: 'photoZoom 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  photoButton: {
    background: 'linear-gradient(135deg, #2e7dff, #764ba2)',
    border: 'none',
    borderRadius: '20px',
    padding: '1.2rem 2.5rem',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 15px 35px rgba(46, 125, 255, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  },

  // Boutons d'action avec effets 3D
  buttonGroup: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '2rem',
  },

  button: {
    padding: '1.5rem 3rem',
    borderRadius: '25px',
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    perspective: '1000px',
  },

  saveButton: {
    background: 'linear-gradient(135deg, #2e7dff 0%, #764ba2 50%, #f093fb 100%)',
    color: 'white',
    boxShadow: '0 20px 40px rgba(46, 125, 255, 0.4)',
    animation: 'buttonPulse 2s ease-in-out infinite',
  },

  cancelButton: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
    backdropFilter: 'blur(15px)',
    color: 'rgba(255, 255, 255, 0.8)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  },

  // Messages d'état avec animations
  statusMessage: {
    padding: '1.5rem 2rem',
    borderRadius: '20px',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: '2rem',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    animation: 'messageSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  errorMessage: {
    background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.2), rgba(245, 87, 108, 0.1))',
    color: '#ff6b8a',
    border: '1px solid rgba(245, 87, 108, 0.3)',
    animation: 'errorShake 0.5s ease-in-out',
  },

  successMessage: {
    background: 'linear-gradient(135deg, rgba(56, 193, 114, 0.2), rgba(56, 193, 114, 0.1))',
    color: '#4ade80',
    border: '1px solid rgba(56, 193, 114, 0.3)',
    animation: 'successBounce 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  loadingMessage: {
    background: 'linear-gradient(135deg, rgba(46, 125, 255, 0.2), rgba(46, 125, 255, 0.1))',
    color: '#60a5fa',
    border: '1px solid rgba(46, 125, 255, 0.3)',
    animation: 'loadingPulse 1.5s ease-in-out infinite',
  },

  // Spinner de loading avec morphing
  loadingSpinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spinMorph 1s linear infinite',
  },

  // Textarea avec resize custom
  textarea: {
    width: '100%',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.95)',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: 500,
  },

  // Responsive breakpoints
  '@media (max-width: 768px)': {
    bentoGrid: {
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
    formSectionLarge: {
      gridColumn: '1',
    },
    formSectionMedium: {
      gridColumn: '1',
    },
    formSectionSmall: {
      gridColumn: '1',
    },
  },
};

// CSS avancé avec animations révolutionnaires
const advancedAnimations = `
  @keyframes containerEntrance {
    0% {
      opacity: 0;
      transform: translateY(100px) scale(0.9) rotateX(10deg);
      filter: blur(10px);
    }
    50% {
      opacity: 0.7;
      transform: translateY(20px) scale(0.95) rotateX(5deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
      filter: blur(0);
    }
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
    }
    25% {
      transform: translateY(-30px) rotate(90deg) scale(1.05);
    }
    50% {
      transform: translateY(-20px) rotate(180deg) scale(0.95);
    }
    75% {
      transform: translateY(-40px) rotate(270deg) scale(1.1);
    }
  }

  @keyframes morphing {
    0%, 100% {
      borderRadius: 50% 60% 70% 40%;
      transform: rotate(0deg) scale(1);
    }
    25% {
      borderRadius: 70% 40% 50% 60%;
      transform: rotate(90deg) scale(1.1);
    }
    50% {
      borderRadius: 40% 70% 60% 50%;
      transform: rotate(180deg) scale(0.9);
    }
    75% {
      borderRadius: 60% 50% 40% 70%;
      transform: rotate(270deg) scale(1.05);
    }
  }

  @keyframes slideInDown {
    0% {
      opacity: 0;
      transform: translateY(-100px) rotateX(-90deg);
    }
    50% {
      opacity: 0.8;
      transform: translateY(-10px) rotateX(-10deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotateX(0deg);
    }
  }

  @keyframes cardSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-50px) translateY(30px) rotateY(-15deg) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateX(0) translateY(0) rotateY(0deg) scale(1);
    }
  }

  @keyframes shimmerMove {
    0% {
      left: -100%;
    }
    50% {
      left: 0%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes titleGlow {
    0% {
      filter: drop-shadow(0 0 10px rgba(46, 125, 255, 0.5));
    }
    100% {
      filter: drop-shadow(0 0 20px rgba(118, 75, 162, 0.7));
    }
  }

  @keyframes buttonFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-8px) rotate(5deg);
    }
  }

  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      box-shadow: 0 4px 15px rgba(46, 125, 255, 0.3);
    }
    50% {
      transform: scale(1.1) rotate(180deg);
      box-shadow: 0 8px 25px rgba(118, 75, 162, 0.5);
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes photoFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
    }
    33% {
      transform: translateY(-10px) rotate(2deg) scale(1.02);
    }
    66% {
      transform: translateY(-5px) rotate(-1deg) scale(0.98);
    }
  }

  @keyframes photoZoom {
    0% {
      transform: scale(0) rotate(180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) rotate(90deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes buttonPulse {
    0%, 100% {
      box-shadow: 0 20px 40px rgba(46, 125, 255, 0.4);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 25px 50px rgba(118, 75, 162, 0.6);
      transform: scale(1.02);
    }
  }

  @keyframes messageSlide {
    0% {
      opacity: 0;
      transform: translateY(-30px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px) rotate(-2deg); }
    75% { transform: translateX(8px) rotate(2deg); }
  }

  @keyframes successBounce {
    0% {
      transform: scale(0.8) translateY(20px);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) translateY(-5px);
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes loadingPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes spinMorph {
    0% {
      transform: rotate(0deg) scale(1);
      border-radius: 50%;
    }
    25% {
      transform: rotate(90deg) scale(1.1);
      border-radius: 30%;
    }
    50% {
      transform: rotate(180deg) scale(0.9);
      border-radius: 50%;
    }
    75% {
      transform: rotate(270deg) scale(1.1);
      border-radius: 70%;
    }
    100% {
      transform: rotate(360deg) scale(1);
      border-radius: 50%;
    }
  }

  /* Effets de hover avancés */
  .form-card:hover {
    transform: translateY(-8px) rotateX(5deg) rotateY(2deg) scale(1.02);
    box-shadow: 0 30px 60px rgba(46, 125, 255, 0.2);
  }

  .form-card:hover .card-hover-effect {
    opacity: 1;
  }

  .input-container:hover .input-glow {
    opacity: 0.3;
  }

  .input-container:focus-within .input-glow {
    opacity: 0.5;
  }

  .photo-button:hover {
    transform: translateY(-5px) rotateX(10deg) scale(1.05);
    box-shadow: 0 25px 50px rgba(46, 125, 255, 0.6);
  }

  .save-button:hover {
    transform: translateY(-8px) rotateX(10deg) scale(1.05);
    box-shadow: 0 30px 60px rgba(46, 125, 255, 0.6);
  }

  .cancel-button:hover {
    transform: translateY(-5px) rotateX(5deg) scale(1.02);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15));
  }

  .close-button:hover {
    transform: translateY(-3px) rotate(90deg) scale(1.1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
  }

  /* Animations de délai en cascade */
  .form-card:nth-child(1) { animation-delay: 0.1s; }
  .form-card:nth-child(2) { animation-delay: 0.2s; }
  .form-card:nth-child(3) { animation-delay: 0.3s; }
  .form-card:nth-child(4) { animation-delay: 0.4s; }
  .form-card:nth-child(5) { animation-delay: 0.5s; }
  .form-card:nth-child(6) { animation-delay: 0.6s; }
  .form-card:nth-child(7) { animation-delay: 0.7s; }
  .form-card:nth-child(8) { animation-delay: 0.8s; }

  /* Responsive design avec animations */
  @media (max-width: 768px) {
    .bento-grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem;
    }
    
    .form-section-large,
    .form-section-medium,
    .form-section-small {
      grid-column: 1 !important;
    }
    
    .title {
      font-size: 2rem !important;
    }
    
    .photo-container {
      width: 150px !important;
      height: 150px !important;
    }
  }

  /* Effets de particules flottantes */
  .floating-particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: radial-gradient(circle, rgba(46, 125, 255, 0.8), transparent);
    border-radius: 50%;
    animation: particleDrift 8s linear infinite;
  }

  @keyframes particleDrift {
    0% {
      opacity: 0;
      transform: translateY(100vh) translateX(0px) scale(0);
    }
    10% {
      opacity: 1;
      transform: translateY(90vh) translateX(10px) scale(1);
    }
    90% {
      opacity: 1;
      transform: translateY(10vh) translateX(-10px) scale(0.5);
    }
    100% {
      opacity: 0;
      transform: translateY(0vh) translateX(0px) scale(0);
    }
  }
`;

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
  const [loading, setLoading] = useState(false);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState('');
  const [focusedInputs, setFocusedInputs] = useState(new Set());

  // Initialisation du formulaire
  useEffect(() => {
    if (location.state?.patientProfile) {
      const patientData = location.state.patientProfile;
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
    } else {
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
  }, [location.state?.patientProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFocus = (inputName) => {
    setFocusedInputs(prev => new Set([...prev, inputName]));
  };

  const handleBlur = (inputName) => {
    setFocusedInputs(prev => {
      const newSet = new Set(prev);
      newSet.delete(inputName);
      return newSet;
    });
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
    setLoading(true);

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

    try {
      const updatedPatient = await updatePatientProfile(userUid, dataToUpdate, idToken);

      if (updatedPatient.error) {
        setError(updatedPatient.error);
        return;
      }

      setSuccess("✨ Profil mis à jour avec succès ! ✨");

      setTimeout(() => {
        navigate('/patient', { state: { patientProfile: updatedPatient } });
      }, 2000);

    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      let errorMessage = "Impossible de mettre à jour le profil. Erreur réseau ou serveur.";
      if (err.response && err.response.data) {
        errorMessage = err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Générateur de particules flottantes
  const FloatingParticles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      particles.push(
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      );
    }
    return particles;
  };

  return (
    <>
      <style>{advancedAnimations}</style>
      <div style={formStyles.pageWrapper}>
        {/* Arrière-plan animé */}
        <div style={formStyles.backgroundParticles}></div>
        <div style={formStyles.morphingBlob}></div>
        <FloatingParticles />

        <div style={formStyles.container}>
          {/* Header avec glassmorphism */}
          <div style={formStyles.headerCard}>
            <div style={formStyles.shimmerOverlay}></div>
            <h1 style={formStyles.title}>
              Modifier mon profil
            </h1>
            <button
              className="close-button"
              style={formStyles.closeButton}
              onClick={() => navigate('/patient')}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages de statut */}
          {loading && (
            <div style={{ ...formStyles.statusMessage, ...formStyles.loadingMessage }}>
              <div style={formStyles.loadingSpinner}></div>
              <FaMagic style={{ marginLeft: '1rem' }} />
              Enregistrement magique en cours...
            </div>
          )}
          {error && (
            <div style={{ ...formStyles.statusMessage, ...formStyles.errorMessage }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ ...formStyles.statusMessage, ...formStyles.successMessage }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bento-grid" style={formStyles.bentoGrid}>
              {/* Section identité - Large */}
              <div className="form-card form-section-large" style={formStyles.formSectionLarge}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaUser />
                  </div>
                  Identité
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Nom"
                      value={formData.nom}
                      onChange={handleChange}
                      onFocus={() => handleFocus('nom')}
                      onBlur={() => handleBlur('nom')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('nom') ? formStyles.inputFocused : {})
                      }}
                      required
                    />
                  </div>

                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                      onFocus={() => handleFocus('prenom')}
                      onBlur={() => handleBlur('prenom')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('prenom') ? formStyles.inputFocused : {})
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section naissance et genre - Medium */}
              <div className="form-card form-section-medium" style={formStyles.formSectionMedium}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    📅
                  </div>
                  Naissance & Genre
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="date"
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleChange}
                      style={formStyles.input}
                      required
                    />
                  </div>

                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      style={formStyles.input}
                      required
                    >
                      <option value="">Sélectionner le sexe</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                      <option value="A">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section contact - Small */}
              <div className="form-card form-section-small" style={formStyles.formSectionSmall}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaPhone />
                  </div>
                  Contact
                </div>

                <div style={formStyles.inputContainer}>
                  <div className="input-glow" style={formStyles.inputGlow}></div>
                  <input
                    type="tel"
                    name="numero_telephone"
                    placeholder="Téléphone"
                    value={formData.numero_telephone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('numero_telephone')}
                    onBlur={() => handleBlur('numero_telephone')}
                    style={{
                      ...formStyles.input,
                      ...(focusedInputs.has('numero_telephone') ? formStyles.inputFocused : {})
                    }}
                  />
                </div>
              </div>

              {/* Section email - Small */}
              <div className="form-card form-section-small" style={formStyles.formSectionSmall}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaEnvelope />
                  </div>
                  Email
                </div>

                <div style={formStyles.inputContainer}>
                  <input
                    type="email"
                    name="courriel"
                    value={formData.courriel}
                    style={{ ...formStyles.input, opacity: 0.7 }}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Section santé - Small */}
              <div className="form-card form-section-small" style={formStyles.formSectionSmall}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaHeartbeat />
                  </div>
                  Groupe Sanguin
                </div>

                <div style={formStyles.inputContainer}>
                  <div className="input-glow" style={formStyles.inputGlow}></div>
                  <select
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
              </div>

              {/* Section adresse - Large */}
              <div className="form-card form-section-large" style={formStyles.formSectionLarge}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaMapMarkerAlt />
                  </div>
                  Adresse
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="quartier"
                      placeholder="Quartier"
                      value={formData.quartier}
                      onChange={handleChange}
                      onFocus={() => handleFocus('quartier')}
                      onBlur={() => handleBlur('quartier')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('quartier') ? formStyles.inputFocused : {})
                      }}
                    />
                  </div>

                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="ville"
                      placeholder="Ville"
                      value={formData.ville}
                      onChange={handleChange}
                      onFocus={() => handleFocus('ville')}
                      onBlur={() => handleBlur('ville')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('ville') ? formStyles.inputFocused : {})
                      }}
                    />
                  </div>

                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="pays"
                      placeholder="Pays"
                      value={formData.pays}
                      onChange={handleChange}
                      onFocus={() => handleFocus('pays')}
                      onBlur={() => handleBlur('pays')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('pays') ? formStyles.inputFocused : {})
                      }}
                    />
                  </div>

                  <div style={formStyles.inputContainer}>
                    <div className="input-glow" style={formStyles.inputGlow}></div>
                    <input
                      type="text"
                      name="boite_postale"
                      placeholder="Boîte Postale"
                      value={formData.boite_postale}
                      onChange={handleChange}
                      onFocus={() => handleFocus('boite_postale')}
                      onBlur={() => handleBlur('boite_postale')}
                      style={{
                        ...formStyles.input,
                        ...(focusedInputs.has('boite_postale') ? formStyles.inputFocused : {})
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section photo - Medium */}
              <div className="form-card form-section-medium" style={formStyles.formSectionMedium}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    <FaCamera />
                  </div>
                  Photo de Profil
                </div>

                <div style={formStyles.photoSection}>
                  <div style={formStyles.photoContainer}>
                    {currentPhotoPreview ? (
                      <img
                        src={currentPhotoPreview}
                        alt="Aperçu"
                        style={formStyles.photoPreview}
                      />
                    ) : (
                      <FaUser style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.5)' }} />
                    )}
                  </div>

                  <label htmlFor="photo_file" className="photo-button" style={formStyles.photoButton}>
                    <FaCamera />
                    {currentPhotoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                      backgroundSize: '20px 20px',
                      animation: 'shimmerMove 2s linear infinite',
                      borderRadius: '20px',
                    }}></div>
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

              {/* Section biographie - Full */}
              <div className="form-card form-section-full" style={formStyles.formSectionFull}>
                <div className="card-hover-effect" style={formStyles.cardHoverEffect}></div>
                
                <div style={formStyles.label}>
                  <div style={formStyles.labelIcon}>
                    📝
                  </div>
                  Notes / Mini Biographie
                </div>

                <div style={formStyles.inputContainer}>
                  <div className="input-glow" style={formStyles.inputGlow}></div>
                  <textarea
                    name="mini_biographie"
                    placeholder="Ajoutez des notes personnelles ou une mini biographie..."
                    value={formData.mini_biographie}
                    onChange={handleChange}
                    onFocus={() => handleFocus('mini_biographie')}
                    onBlur={() => handleBlur('mini_biographie')}
                    style={{
                      ...formStyles.textarea,
                      ...(focusedInputs.has('mini_biographie') ? formStyles.inputFocused : {})
                    }}
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div style={formStyles.buttonGroup}>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate('/patient')}
                  style={formStyles.cancelButton}
                >
                  <FaTimes />
                  Annuler
                </button>

                <button
                  type="submit"
                  className="save-button"
                  style={{
                    ...formStyles.saveButton,
                    ...(loading ? { opacity: 0.8, cursor: 'not-allowed' } : {})
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div style={formStyles.loadingSpinner}></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Enregistrer
                    </>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                    backgroundSize: '30px 30px',
                    animation: loading ? 'shimmerMove 1.5s linear infinite' : 'none',
                    borderRadius: '25px',
                  }}></div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}