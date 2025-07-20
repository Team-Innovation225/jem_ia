import React, { useState, useEffect } from "react";
import {
  FaUserMd, FaUsers, FaFilePrescription, FaComments, FaUserCircle, FaStethoscope, FaVideo,
  FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash, FaShareSquare, FaBars, FaTimes,
  FaStop, FaPaperPlane, FaTrash, FaPause, FaPlay,
} from "react-icons/fa";
import StatCard from "./StatCard"; // ou le bon chemin


export default function MedecinDashboard() {
  // États de base
  const [vue, setVue] = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [ordonnance, setOrdonnance] = useState({ medicament: "", posologie: "", duree: "", remarque: "" });
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
    const [statPatients, setStatPatients] = useState(0);
    const [statConsults, setStatConsults] = useState(0);
    const [statOrdonnances, setStatOrdonnances] = useState(0);
    const [statUrgences, setStatUrgences] = useState(0);
    const [statNouveaux, setStatNouveaux] = useState(0);
    const [statDossiers, setStatDossiers] = useState(0);
    const [statDuJour, setStatDuJour] = useState(0);
    const [statAlertesIA, setStatAlertesIA] = useState(0);
    const [statFichiers, setStatFichiers] = useState(0);
    const [statMessages, setStatMessages] = useState(0);

  
  const firebaseUid = "TonUIDFirebase"; // récupéré depuis auth ou contexte
  const BASE_URL = "https://ton-backend.ngrok-free.app"; // ton API

  // ✅ Appel à l'API dashboard
  useEffect(() => {
    fetch(`${BASE_URL}/medecin/dashboard/${firebaseUid}/`)
      .then(res => res.json())
      .then(stats => {
        setStatPatients(stats.patients);
        setStatConsults(stats.consultations);
        setStatOrdonnances(stats.ordonnances);
        setStatUrgences(stats.urgences);
        setStatNouveaux(stats.nouveaux_patients);
        setStatDossiers(stats.dossiers_incomplets);
        setStatDuJour(stats.consultations_du_jour);
        setStatAlertesIA(stats.alertes_ia);
        setStatFichiers(stats.fichiers_recus);
        setStatMessages(stats.messages_non_lus);
      });
  }, []);


  // Couleurs
  const colors = {
    bleu: "#2e7dff",
    vert: "#38b6ff",
    vertDoux: "#b6fcd5",
    gris: "#f7f7f8",
    grisFonce: "#e0eafc",
    blanc: "#fff",
    accent: "#38b6ff",
    danger: "#e53e3e",
  };

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // API calls - Exemples pour Django
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    setLoading(true);
    try {
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
      const response = await fetch(`/api/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'same-origin',
        body: data ? JSON.stringify(data) : null,
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fonctions API
  const fetchPatients = async () => {
    const data = await apiCall('patients/');
    if (data) setPatients(data);
  };

  const createOrdonnance = async (patientId) => {
    const data = await apiCall('ordonnances/', 'POST', {
      patient: patientId,
      ...ordonnance
    });
    if (data) {
      setOrdonnance({ medicament: "", posologie: "", duree: "", remarque: "" });
      alert('Ordonnance créée avec succès');
    }
  };

  const startTeleconsultation = async (patientId) => {
    const data = await apiCall('teleconsultations/', 'POST', {
      patient: patientId,
      status: 'active'
    });
    if (data) {
      setIsVideoCall(true);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sidebar links
  const sidebarLinks = [
    { label: "Tableau de bord", icon: <FaStethoscope />, vue: "dashboard" },
    { label: "Mes Patients", icon: <FaUsers />, vue: "patients" },
    { label: "Téléconsultation", icon: <FaVideo />, vue: "teleconsultation" },
    { label: "Ordonnances", icon: <FaFilePrescription />, vue: "ordonnances" },
    { label: "Messages", icon: <FaComments />, vue: "messages" },
    { label: "Mon Profil", icon: <FaUserMd />, vue: "profil" },
  ];

  const handleOrdonnanceSubmit = (e) => {
    e.preventDefault();
    if (selectedPatient) {
      createOrdonnance(selectedPatient.id);
    }
  };

  const startVideoCall = () => {
    if (selectedPatient) {
      startTeleconsultation(selectedPatient.id);
    } else {
      setIsVideoCall(true);
    }
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Styles responsives
  const sidebarStyle = {
    width: isMobile ? '100%' : 240,
    background: colors.blanc,
    borderRight: isMobile ? 'none' : `1px solid ${colors.grisFonce}`,
    padding: "1rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    minHeight: "100vh",
    position: isMobile ? 'fixed' : 'static',
    top: 0,
    left: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
    zIndex: 1000,
    transition: 'left 0.3s ease',
  };

  const mainStyle = {
    flex: 1,
    padding: isMobile ? "1rem" : "2.5rem 2rem",
    maxWidth: isMobile ? '100%' : 1200,
    margin: "0 auto",
  };

  const cardStyle = {
    background: colors.blanc,
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
    padding: isMobile ? "1.5rem" : "2rem",
    marginBottom: "1rem",
  };

  const inputStyle = {
    padding: isMobile ? "0.6rem" : "0.8rem",
    borderRadius: 8,
    border: `1px solid ${colors.grisFonce}`,
    fontSize: isMobile ? "0.9rem" : "1rem",
    width: "100%",
  };

  const buttonStyle = (bg) => ({
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: isMobile ? "0.6rem 1rem" : "0.7rem 1.2rem",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: isMobile ? "0.9rem" : "1rem",
    width: isMobile ? "100%" : "auto",
    marginBottom: isMobile ? "0.5rem" : 0,
  });

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "Segoe UI, Arial, sans-serif",
      background: colors.gris,
      position: "relative",
    }}>
      {/* Overlay pour mobile */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <nav style={sidebarStyle}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          padding: "0 1rem",
          marginBottom: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaStethoscope size={24} color={colors.bleu} />
            <div style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? "1.1rem" : "1.3rem", 
              color: colors.bleu 
            }}>
              SantéAI
            </div>
          </div>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "none",
                border: "none",
                color: colors.bleu,
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <div style={{ flex: 1, padding: "0 1rem" }}>
          {sidebarLinks.map(link => (
            <button
              key={link.vue}
              onClick={() => {
                setVue(link.vue);
                if (isMobile) setSidebarOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                width: "100%",
                background: vue === link.vue ? colors.bleu : "transparent",
                color: vue === link.vue ? "#fff" : "#222",
                border: "none",
                borderRadius: "8px",
                padding: isMobile ? "0.8rem 1rem" : "0.9rem 1.5rem",
                fontWeight: 600,
                fontSize: isMobile ? "0.95rem" : "1.08rem",
                cursor: "pointer",
                marginBottom: "0.5rem",
                transition: "background 0.2s",
              }}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main style={mainStyle}>
        {/* Header mobile */}
        {isMobile && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
            padding: "0.5rem 0",
          }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: "none",
                border: "none",
                color: colors.bleu,
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              <FaBars />
            </button>
            <div style={{ 
              fontWeight: 700, 
              fontSize: "1.2rem", 
              color: colors.bleu 
            }}>
              SantéAI Médecin
            </div>
            <div style={{ width: "1.5rem" }} />
          </div>
        )}

        {/* Tableau de bord */}
        {vue === "dashboard" && (
          <section>
            <div style={cardStyle}>
              <div style={{ textAlign: "center" }}>
                <FaStethoscope size={isMobile ? 36 : 48} color={colors.bleu} style={{ marginBottom: 16 }} />
                <h2 style={{ 
                  color: colors.bleu, 
                  marginBottom: 8,
                  fontSize: isMobile ? "1.3rem" : "1.5rem"
                }}>
                  Tableau de bord
                </h2>
                <p style={{ color: "#666", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                  Bienvenue sur votre espace médecin
                </p>
              </div>
              
              {/* Stats rapides */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                justifyContent: "space-between",
                marginTop: "2rem"
              }}>
                <StatCard label="Patients" value={statPatients} color={colors.bleu} />
                <StatCard label="Consultations" value={statConsults} color={colors.vert} />
                <StatCard label="Ordonnances" value={statOrdonnances} color={colors.accent} />
                <StatCard label="Urgences IA" value={statUrgences} color={colors.danger} />
                <StatCard label="Nouveaux ce mois" value={statNouveaux} color={colors.bleu} />
                <StatCard label="Dossiers incomplets" value={statDossiers} color={colors.danger} />
                <StatCard label="Consultations du jour" value={statDuJour} color={colors.vert} />
                <StatCard label="Alertes IA (à surveiller)" value={statAlertesIA} color={colors.accent} />
                <StatCard label="Fichiers médicaux reçus" value={statFichiers} color={colors.bleu} />
                <StatCard label="Messages non lus" value={statMessages} color={colors.danger} />
                
              </div>
            </div>
          </section>
        )}

        {/* Mes Patients */}
        {vue === "patients" && (
          <section>
            <div style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? "1.2rem" : "1.3rem", 
              color: colors.bleu, 
              marginBottom: "1.5rem" 
            }}>
              Mes Patients
            </div>
            <div style={cardStyle}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div>Chargement...</div>
                </div>
              ) : patients.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}>
                  {patients.map(patient => (
                    <div key={patient.id} style={{
                      background: colors.gris,
                      padding: "1rem",
                      borderRadius: 8,
                      border: `1px solid ${colors.grisFonce}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <FaUserCircle size={32} color={colors.bleu} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{patient.nom} {patient.prenom}</div>
                          <div style={{ color: "#666", fontSize: "0.9rem" }}>
                            {patient.age} ans - {patient.telephone}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        gap: "0.5rem", 
                        marginTop: "1rem",
                        flexDirection: isMobile ? "column" : "row"
                      }}>
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          style={buttonStyle(colors.bleu)}
                        >
                          Voir dossier
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPatient(patient);
                            startVideoCall();
                          }}
                          style={buttonStyle(colors.vert)}
                        >
                          Téléconsultation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <FaUsers size={isMobile ? 36 : 48} color={colors.bleu} style={{ marginBottom: 16 }} />
                  <p style={{ color: "#666" }}>Aucun patient enregistré</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Téléconsultation */}
        {vue === "teleconsultation" && (
          <section>
            <div style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? "1.2rem" : "1.3rem", 
              color: colors.bleu, 
              marginBottom: "1.5rem" 
            }}>
              Téléconsultation
            </div>
            
            {!isVideoCall ? (
              <div style={cardStyle}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <FaVideo size={isMobile ? 36 : 48} color={colors.bleu} style={{ marginBottom: 16 }} />
                  <h2 style={{ 
                    color: colors.bleu, 
                    marginBottom: 8,
                    fontSize: isMobile ? "1.2rem" : "1.4rem"
                  }}>
                    Prêt pour la téléconsultation
                  </h2>
                  <p style={{ color: "#666", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                    Démarrez un appel vidéo avec votre patient
                  </p>
                </div>

                {/* Aperçu de la caméra */}
                <div style={{
                  background: "#000",
                  borderRadius: 12,
                  height: isMobile ? 200 : 300,
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  <div style={{
                    background: colors.bleu,
                    borderRadius: "50%",
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaUserMd size={isMobile ? 24 : 32} color="#fff" />
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    color: "#fff",
                    fontSize: isMobile ? "0.8rem" : "0.9rem"
                  }}>
                    Dr. Nom (Vous)
                  </div>
                </div>

                {/* Contrôles pré-appel */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  marginBottom: "2rem"
                }}>
                  <button 
                    onClick={toggleMic}
                    style={{
                      background: isMicOn ? colors.bleu : colors.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isMicOn ? <FaMicrophone size={isMobile ? 14 : 16} /> : <FaMicrophoneSlash size={isMobile ? 14 : 16} />}
                  </button>
                  <button 
                    onClick={toggleCamera}
                    style={{
                      background: isCameraOn ? colors.bleu : colors.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isCameraOn ? <FaVideo size={isMobile ? 14 : 16} /> : <FaVideoSlash size={isMobile ? 14 : 16} />}
                  </button>
                </div>

                {/* Bouton démarrer l'appel */}
                <div style={{ textAlign: "center" }}>
                  <button 
                    onClick={startVideoCall}
                    style={{
                      background: colors.vert,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
                      fontWeight: 600,
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      margin: "0 auto",
                      width: isMobile ? "100%" : "auto",
                      justifyContent: "center"
                    }}
                  >
                    <FaVideo />
                    Démarrer la consultation
                  </button>
                </div>
              </div>
            ) : (
              // Interface pendant l'appel - Version responsive
              <div style={{
                background: "#000",
                borderRadius: 14,
                height: isMobile ? "60vh" : "70vh",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Vidéo du patient (principale) */}
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  <div style={{
                    background: colors.bleu,
                    borderRadius: "50%",
                    width: isMobile ? 80 : 120,
                    height: isMobile ? 80 : 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaUserCircle size={isMobile ? 40 : 60} color="#fff" />
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    color: "#fff",
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: 600
                  }}>
                    {selectedPatient ? `${selectedPatient.nom} ${selectedPatient.prenom}` : "Patient - Marie Dupont"}
                  </div>
                </div>

                {/* Vidéo du médecin (petite fenêtre) */}
                <div style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: isMobile ? 120 : 200,
                  height: isMobile ? 90 : 150,
                  background: "#333",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff"
                }}>
                  <div style={{
                    background: colors.bleu,
                    borderRadius: "50%",
                    width: isMobile ? 40 : 60,
                    height: isMobile ? 40 : 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaUserMd size={isMobile ? 16 : 24} color="#fff" />
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    color: "#fff",
                    fontSize: isMobile ? "0.7rem" : "0.8rem"
                  }}>
                    Vous
                  </div>
                </div>

                {/* Contrôles d'appel */}
                <div style={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: isMobile ? "0.5rem" : "1rem",
                  background: "rgba(0,0,0,0.7)",
                  padding: isMobile ? "0.5rem" : "1rem",
                  borderRadius: 12
                }}>
                  <button 
                    onClick={toggleMic}
                    style={{
                      background: isMicOn ? "rgba(255,255,255,0.2)" : colors.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isMicOn ? <FaMicrophone size={isMobile ? 14 : 16} /> : <FaMicrophoneSlash size={isMobile ? 14 : 16} />}
                  </button>
                  <button 
                    onClick={toggleCamera}
                    style={{
                      background: isCameraOn ? "rgba(255,255,255,0.2)" : colors.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    {isCameraOn ? <FaVideo size={isMobile ? 14 : 16} /> : <FaVideoSlash size={isMobile ? 14 : 16} />}
                  </button>
                  <button 
                    onClick={endVideoCall}
                    style={{
                      background: colors.danger,
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    <FaPhoneSlash size={isMobile ? 14 : 16} />
                  </button>
                  {!isMobile && (
                    <button 
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 48,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                    >
                      <FaShareSquare />
                    </button>
                  )}
                </div>

                {/* Indicateur de connexion */}
                <div style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: 20,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4ade80"
                  }}></div>
                  Connexion stable
                </div>
              </div>
            )}
          </section>
        )}

        {/* Ordonnances */}
        {vue === "ordonnances" && (
          <section>
            <div style={{ 
              fontWeight: 700, 
              fontSize: isMobile ? "1.2rem" : "1.3rem", 
              color: colors.bleu, 
              marginBottom: "1.5rem" 
            }}>
              Créer une ordonnance
            </div>
            <div style={{
              ...cardStyle,
              maxWidth: isMobile ? "100%" : 500,
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem"
            }}>
              <form onSubmit={handleOrdonnanceSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: colors.bleu }}>Médicament :</span>
                    <input 
                      type="text" 
                      value={ordonnance.medicament} 
                      onChange={e => setOrdonnance({ ...ordonnance, medicament: e.target.value })} 
                      style={inputStyle} 
                      required
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: colors.bleu }}>Posologie :</span>
                    <input 
                      type="text" 
                      value={ordonnance.posologie} 
                      onChange={e => setOrdonnance({ ...ordonnance, posologie: e.target.value })} 
                      style={inputStyle} 
                      required
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: colors.bleu }}>Durée :</span>
                    <input 
                      type="text" 
                      value={ordonnance.duree} 
                      onChange={e => setOrdonnance({ ...ordonnance, duree: e.target.value })} 
                      style={inputStyle} 
                      required
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: colors.bleu }}>Remarques :</span>
                    <textarea 
                      value={ordonnance.remarque} 
                      onChange={e => setOrdonnance({ ...ordonnance, remarque: e.target.value })} 
                      style={{ 
                        ...inputStyle,
                        minHeight: "80px",
                        resize: "vertical"
                      }} 
                    />
                  </label>
                  <div style={{ 
                    display: "flex", 
                    gap: "1rem", 
                    marginTop: 8,
                    flexDirection: isMobile ? "column" : "row"
                  }}>
                    <button type="submit" style={buttonStyle(colors.bleu)}>
                      Enregistrer
                    </button>
                    <button type="button" style={buttonStyle(colors.vert)}>
                      Imprimer
                    </button>
                    <button type="button" style={buttonStyle(colors.accent)}>
                      Envoyer au patient
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Messagerie */}
        {vue === "messages" && (
  <section>
    <div style={{ 
      fontWeight: 700, 
      fontSize: isMobile ? "1.2rem" : "1.3rem", 
      color: colors.bleu, 
      marginBottom: "1.5rem" 
    }}>
      Messagerie
    </div>
    <div style={cardStyle}>
      <div style={{ 
        minHeight: isMobile ? 150 : 200, 
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <FaComments size={isMobile ? 36 : 48} color={colors.bleu} style={{ marginBottom: 16 }} />
        <div style={{ 
          color: "#888", 
          textAlign: "center",
          fontSize: isMobile ? "0.9rem" : "1rem"
        }}>
          Sélectionner un patient pour accéder à la messagerie dédiée
        </div>
      </div>
      
      {/* Section Chat Vocal */}
      <div style={{
        borderTop: `1px solid ${colors.grisFonce}`,
        paddingTop: "1rem",
        marginTop: "1rem"
      }}>
        <div style={{ 
          fontSize: isMobile ? "0.9rem" : "1rem",
          fontWeight: 600,
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <FaMicrophone color={colors.bleu} />
          Chat Vocal
        </div>

        {/* Zone d'enregistrement */}
        <div style={{
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          {/* Statut d'enregistrement */}
          {isRecording && (
            <div style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                  animation: "pulse 1s infinite"
                }}></div>
                <span style={{ color: "#b91c1c", fontWeight: 500 }}>Enregistrement en cours...</span>
              </div>
              <span style={{ color: "#b91c1c", fontFamily: "monospace" }}>
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Prévisualisation audio */}
          {currentAudio && !isRecording && (
            <div style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <button
                onClick={() => {
                  if (isPlaying) {
                    currentAudio.pause();
                    setIsPlaying(false);
                  } else {
                    const audio = new Audio(currentAudio);
                    audio.play();
                    setIsPlaying(true);
                    audio.onended = () => setIsPlaying(false);
                  }
                }}
                style={{
                  backgroundColor: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#166534" }}>
                  Enregistrement prêt
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentAudio(null);
                  setAudioChunks([]);
                  setIsPlaying(false);
                }}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  padding: "0.25rem"
                }}
              >
                <FaTrash size={14} />
              </button>
            </div>
          )}

          {/* Boutons de contrôle */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center"
          }}>
            {!isRecording && !currentAudio && (
              <button
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);
                    setAudioChunks([]);
                    
                    recorder.ondataavailable = (event) => {
                      if (event.data.size > 0) {
                        setAudioChunks(prev => [...prev, event.data]);
                      }
                    };
                    
                    recorder.onstop = () => {
                      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                      setCurrentAudio(URL.createObjectURL(audioBlob));
                      stream.getTracks().forEach(track => track.stop());
                    };
                    
                    recorder.start();
                    setIsRecording(true);
                    setRecordingTime(0);
                    
                    // Compteur de temps
                    const interval = setInterval(() => {
                      setRecordingTime(prev => prev + 1);
                    }, 1000);
                    
                    // Stocker l'interval pour le nettoyer plus tard
                    window.recordingInterval = interval;
                    
                  } catch (error) {
                    console.error('Erreur microphone:', error);
                    alert('Impossible d\'accéder au microphone');
                  }
                }}
                style={{
                  backgroundColor: colors.bleu,
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  padding: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaMicrophone size={20} />
              </button>
            )}

            {isRecording && (
              <button
                onClick={() => {
                  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                  }
                  setIsRecording(false);
                  if (window.recordingInterval) {
                    clearInterval(window.recordingInterval);
                  }
                }}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  padding: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaStop size={20} />
              </button>
            )}

            {currentAudio && !isRecording && (
              <button
                onClick={() => {
                  // Logique pour envoyer le message vocal
                  console.log('Envoi du message vocal');
                  // Réinitialiser après envoi
                  setCurrentAudio(null);
                  setAudioChunks([]);
                  setIsPlaying(false);
                }}
                style={{
                  backgroundColor: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  padding: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaPaperPlane size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Liste des conversations récentes */}
      <div style={{
        borderTop: `1px solid ${colors.grisFonce}`,
        paddingTop: "1rem",
        marginTop: "1rem"
      }}>
        <div style={{ 
          fontSize: isMobile ? "0.9rem" : "1rem",
          fontWeight: 600,
          marginBottom: "1rem"
        }}>
          Conversations récentes
        </div>
        <div style={{ color: "#888", fontStyle: "italic" }}>
          Aucune conversation
        </div>
      </div>
    </div>
  </section>
)}

        {/* Profil */}
        {vue === "profil" && (
          <section>
            <div style={{
              ...cardStyle,
              maxWidth: isMobile ? "100%" : 500,
              margin: "0 auto"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1.2rem", 
                marginBottom: 16,
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left"
              }}>
                <FaUserMd size={isMobile ? 36 : 48} color={colors.bleu} />
                <div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: isMobile ? "1.1rem" : "1.2rem" 
                  }}>
                    Dr. Nom
                  </div>
                  <div style={{ 
                    color: "#888",
                    fontSize: isMobile ? "0.9rem" : "1rem"
                  }}>
                    Médecin généraliste
                  </div>
                  <div style={{ 
                    color: "#888",
                    fontSize: isMobile ? "0.9rem" : "1rem"
                  }}>
                    email@santeai.com
                  </div>
                </div>
              </div>
              
              <div style={{
                display: "flex",
                gap: "1rem",
                flexDirection: isMobile ? "column" : "row"
              }}>
                <button style={buttonStyle(colors.bleu)}>
                  Modifier mes informations
                </button>
                <button style={buttonStyle(colors.vert)}>
                  Changer mot de passe
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}