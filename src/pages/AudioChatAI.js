import React from "react";
import {
  FaArrowLeft, FaUserCircle, FaComments, FaCalendarAlt, FaHospital, FaVideo, FaRobot,
  FaPhone, FaUserMd, FaMicrophone, FaPlus, FaEdit,
  FaStethoscope, FaVideoSlash, FaVolumeUp
} from "react-icons/fa";
// import { AnimatePresence, motion } from "framer-motion";
import ChatAI from "./chatAI"; // Ajoute cette ligne en haut
import StructuresPage from "./structures"; // Ajoute cette ligne en haut
import { useNavigate } from "react-router-dom"; // Ajoute cet import en haut si ce n'est pas déjà fait

// Helpers
const Tag = ({ color, children }) => (
  <span style={{
    background: color,
    borderRadius: "1rem",
    padding: "0.3rem 1rem",
    fontWeight: 600,
    fontSize: "1.02rem",
    marginRight: 8,
    display: "inline-block",
  }}>{children}</span>
);

// const InfoLine = ({ icon, label, value }) => (
//   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//     <span>{icon}</span>
//     <span style={{ fontWeight: 600 }}>{label} :</span>
//     <span>{value}</span>
//   </div>
// );

// Menu vertical
const ICONS = [
  { icon: <FaUserCircle size={28} />, label: "Profil" },
  { icon: <FaComments size={28} />, label: "Messages" },
  { icon: <FaCalendarAlt size={28} />, label: "Planning" },
  { icon: <FaHospital size={28} />, label: "Structure" },
  { icon: <FaVideo size={28} />, label: "Téléconsultation" },
  { icon: <FaRobot size={28} />, label: "Chat IA" },
];

// Vue Messages/Chat IA
function MessagesPanel({ patient }) {
  const [messages] = React.useState([
    { id: 1, sender: "ia", content: "Bonjour " + patient.prenom + ", comment vous sentez-vous aujourd'hui ?", time: "10:30" },
    { id: 2, sender: "patient", content: "Bonjour docteur IA, j'ai quelques questions sur mon traitement.", time: "10:32" },
    { id: 3, sender: "ia", content: "Je suis là pour vous aider. Pouvez-vous me préciser vos questions concernant votre traitement ?", time: "10:33" }
  ]);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "#f6fafe",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        maxWidth: 1200, // Augmente la largeur max
        width: "100%",  // Prend toute la largeur possible
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px #2563eb11",
        height: "90vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#e0eafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FaRobot color="#2563eb" size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#2563eb" }}>Assistant IA Médical</div>
            <div style={{ color: "#64748b", fontSize: "0.9rem" }}>En ligne</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sender === "patient" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "70%",
                padding: "1rem 1.2rem",
                borderRadius: msg.sender === "patient" ? "20px 20px 8px 20px" : "20px 20px 20px 8px",
                background: msg.sender === "patient" ? "#2563eb" : "#e0eafc",
                color: msg.sender === "patient" ? "#fff" : "#2563eb",
              }}>
                <div style={{ fontSize: "1rem" }}>{msg.content}</div>
                <div style={{
                  fontSize: "0.8rem",
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: "right"
                }}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Nouveau champ de saisie et boutons */}
        <div style={{
          borderTop: "1px solid #e2e8f0",
          padding: "0.8rem",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f9fafb"
        }}>
          <input
            type="text"
            placeholder="Écrivez un message..."
            style={{
              flex: 1,
              border: "none",
              borderRadius: 20,
              padding: "0.7rem 1.2rem",
              background: "#f1f5f9",
              fontSize: "1rem",
              outline: "none"
            }}
          />
          <button style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            cursor: "pointer"
          }}>
            <FaMicrophone />
          </button>
          <button style={{
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            cursor: "pointer"
          }}>
            <FaComments />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AudioChatAI({ onClose }) {
  const [dashboard, setDashboard] = React.useState(false);
  const [iaDocked, setIaDocked] = React.useState(false);
  const [activeView, setActiveView] = React.useState(null);

  // Exemple de données patient et consultations
  const patient = {
    nom: "Yao",
    prenom: "Elie",
    email: "elie.yao@email.com",
    telephone: "+225 07 00 00 00",
    id_patient: "P123456",
    antecedents: ["Diabète", "Hypertension"],
    traitements_en_cours: ["Metformine", "Amlodipine"],
    medecin_traitant: "Dr. Kouassi",
    notes_medecin: "Patient à surveiller pour la tension.",
    diagnostic: "Bonne évolution.",
    numero_dossier: "D-2024-001",
    groupe_sanguin: "O+",
    antecedents_sensibles: ["VIH"],
    traitements_sensibles: ["Traitement VIH"],
    notes_confidentielles: "A informer seulement le médecin référent.",
    structure: "CHU Treichville"
  };
  const consultationsData = [
    { date: "2024-07-10", motif: "Contrôle tension", structure: "CHU Treichville" }
  ];

  const circleSize = window.innerWidth < 600 ? 260 : 400;

  const iaCircleStyle = iaDocked ? {
    position: "absolute",
    top: 24,
    left: 24 + 90,
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 2px 12px #2563eb33",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
  } : {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: circleSize,
    height: circleSize,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 2px 32px #2563eb33",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transform: "translate(-50%, -50%)",
    transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
  };

  function handleDashboard() {
    setIaDocked(true);
    setDashboard(true);
    setActiveView("Profil");
  }

  // Fonction pour rendre le contenu selon la vue active
  function renderActiveView() {
    switch(activeView) {
      case "Profil":
        return (
          <DashboardPanel
            patient={patient}
            consultationsData={consultationsData}
            setActivePage={setActiveView}
          />
        );
      case "Messages":
        return <MessagesPanel patient={patient} />;
      case "Planning":
        return <PlanningPanel patient={patient} />;
      case "Structure":
        return <StructuresPage />; // Affiche la vue structures.js
      case "Téléconsultation":
        return <TeleconsultationPanel patient={patient} />;
      case "Chat IA":
        return <ChatAI />;
      default:
        return (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontSize: "2rem",
            color: "#2563eb",
            fontWeight: 700,
          }}>
            Dashboard SantéAI
          </div>
        );
    }
  }

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, #e0eafc 0%, #f6fafe 100%)",
    }}>
      {/* Animation vidéo de fond */}
      <video
        src="/ia-back.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.18,
        }}
      />

      {/* Menu vertical à gauche - affiché seulement si iaDocked */}
      {iaDocked && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 90,
          height: "100vh",
          background: "rgba(255,255,255,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          zIndex: 15,
          backdropFilter: "blur(2px)",
        }}>
          {ICONS.map(item => (
            <div
              key={item.label}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: activeView === item.label ? "#2563eb" : "#e0eafc",
                color: activeView === item.label ? "#fff" : "#2563eb",
                boxShadow: "0 2px 8px #2563eb22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                cursor: "pointer",
                fontSize: 28,
                border: activeView === item.label ? "2px solid #2563eb" : "none",
                transition: "all 0.2s",
              }}
              title={item.label}
              onClick={() => {
                setActiveView(item.label);
                setDashboard(true);
              }}
            >
              {item.icon}
            </div>
          ))}
        </div>
      )}

      {/* Cercle IA animé */}
      <div style={{
        ...iaCircleStyle,
        boxShadow: iaDocked
          ? "0 2px 12px #2563eb33"
          : "0 0 60px 10px #92b3da5a, 0 0 120px 30px rgba(103, 205, 215, 0.86)",
        background: iaDocked
          ? "#fff"
          : "radial-gradient(circle at 60% 40%, #a7c7f9 0%, #b7e4c7 60%, #d1c4e9 100%)",
        border: iaDocked ? "none" : "4px solid #fff",
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        zIndex: 10,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
      }}>
        <div style={{
          width: iaDocked ? 36 : 80,
          height: iaDocked ? 36 : 80,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 20px 4px #4A90E244",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <span style={{
            fontSize: iaDocked ? "1.1rem" : "1.5rem",
            fontWeight: "bold",
            color: "#4A90E2",
            letterSpacing: "1px",
            textShadow: "0 2px 8px #27AE6044",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}>
            SantéAI
          </span>
          <span style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4A90E2, #27AE60)",
            boxShadow: "0 0 8px 2px #4A90E288",
            border: "2px solid #fff",
            animation: "iaPulse 2s infinite",
          }} />
        </div>
        {/* Flèche à gauche du cercle */}
        {!iaDocked && (
          <div
            style={{
              position: "absolute",
              left: -320,
              top: "50%",
              transform: "translateY(-40%)",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "2rem",
              padding: "0.7rem 1.3rem",
              fontWeight: 600,
              fontSize: 18,
              boxShadow: "0 2px 8px #2563eb33",
              border: "none",
              outline: "none",
              zIndex: 20,
              gap: 12,
            }}
            onClick={handleDashboard}
          >
            <FaArrowLeft size={22} />
            Accéder au dashboard
          </div>
        )}
      </div>

      {/* Dashboard plein écran */}
      {dashboard && iaDocked && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(255,255,255,0.5)",
          zIndex: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <button
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "1rem",
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px #2563eb33",
              zIndex: 21,
            }}
            onClick={() => {
              setDashboard(false);
              setIaDocked(false);
              setActiveView(null);
            }}
          >
            Fermer
          </button>
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            background: "transparent",
            boxShadow: "none",
          }}>
            {renderActiveView()}
          </div>
        </div>
      )}
    </div>
  );
}

// Vue Planning
function PlanningPanel({ patient }) {
  const [appointments] = React.useState([
    { id: 1, date: "2024-07-22", time: "09:00", type: "Consultation", medecin: "Dr. Kouassi", status: "confirmé" },
    { id: 2, date: "2024-07-25", time: "14:30", type: "Contrôle", medecin: "Dr. Yao", status: "en attente" },
    { id: 3, date: "2024-07-28", time: "11:00", type: "Téléconsultation", medecin: "Dr. Kouassi", status: "confirmé" },
  ]);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#f6fafe",
      padding: "1rem",
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {/* Header */}
        <div style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 12px #2563eb11",
          padding: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <h2 style={{ margin: 0, color: "#2563eb", fontSize: "1.5rem" }}>Mon Planning</h2>
            <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>Gérez vos rendez-vous médicaux</p>
          </div>
          <button style={{
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.6rem 1.3rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <FaPlus /> Nouveau RDV
          </button>
        </div>

        {/* Calendrier */}
        <div style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 12px #2563eb11",
          padding: "1.5rem",
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#2563eb" }}>Rendez-vous à venir</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appointments.map(apt => (
              <div key={apt.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "#f8fafc",
                borderRadius: 12,
                border: `2px solid ${apt.status === 'confirmé' ? '#10b981' : '#f59e0b'}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: apt.type === "Téléconsultation" ? "#e0eafc" : "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {apt.type === "Téléconsultation" ?
                      <FaVideo color="#2563eb" size={20} /> :
                      <FaStethoscope color="#10b981" size={20} />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2563eb" }}>
                      {apt.type} - {apt.medecin}
                    </div>
                    <div style={{ color: "#64748b" }}>
                      {new Date(apt.date).toLocaleDateString()} à {apt.time}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag color={apt.status === 'confirmé' ? '#10b981' : '#f59e0b'}>
                    {apt.status}
                  </Tag>
                  <button style={{
                    background: "#64748b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "0.3rem 0.8rem",
                    cursor: "pointer",
                  }}>
                    <FaEdit size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Vue Téléconsultation
function TeleconsultationPanel({ patient }) {
  const [isInCall, setIsInCall] = React.useState(false);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [isMicOn, setIsMicOn] = React.useState(true);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#f6fafe",
      padding: "1rem",
    }}>
      <div style={{
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {!isInCall ? (
          // Vue avant appel
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 12px #2563eb11",
            padding: "2rem",
            textAlign: "center",
          }}>
            <h2 style={{ color: "#2563eb", marginBottom: "2rem" }}>Téléconsultation</h2>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#e0eafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem auto",
            }}>
              <FaVideo color="#2563eb" size={48} />
            </div>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              Préparez-vous pour votre téléconsultation avec Dr. Kouassi
            </p>
            <button
              onClick={() => setIsInCall(true)}
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "0 auto",
              }}
            >
              <FaVideo /> Démarrer la consultation
            </button>
          </div>
        ) : (
          // Vue en appel
          <div style={{
            background: "#000",
            borderRadius: 16,
            height: "80vh",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Vidéo principale (médecin) */}
            <div style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#e0eafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <FaUserMd color="#2563eb" size={48} />
              </div>
              <div style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                color: "#fff",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}>
                Dr. Kouassi
              </div>
            </div>

            {/* Vidéo patient (petite fenêtre) */}
            <div style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 200,
              height: 150,
              background: "#2563eb",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}>
              <FaUserCircle color="#fff" size={48} />
            </div>

            {/* Contrôles */}
            <div style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 12,
            }}>
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                style={{
                  background: isCameraOn ? "#64748b" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCameraOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
              </button>
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                style={{
                  background: isMicOn ? "#64748b" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaVolumeUp size={20} />}
              </button>
              <button
                onClick={() => setIsInCall(false)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPhone size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// DashboardPanel (vue Profil)
function DashboardPanel({ patient, consultationsData, setActivePage }) {
  const navigate = useNavigate(); // Ajoute ce hook

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "none",
        padding: "2.5rem 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: 24,
          boxShadow: "0 4px 32px #2563eb11",
          padding: "2.5rem 3rem",
          display: "flex",
          gap: "2.5rem",
        }}
      >
        {/* Colonne gauche : Avatar et infos principales */}
        <div style={{ minWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 12 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#e0eafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                color: "#2563eb",
                boxShadow: "0 2px 12px #2563eb22",
                position: "relative",
              }}
            >
              <FaUserCircle />
            </div>
            <button
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 4px #2563eb33",
                cursor: "pointer",
                fontSize: 18,
                zIndex: 2,
              }}
              title="Éditer le profil"
              onClick={() => navigate("/edit-profile", { state: { patientProfile: patient } })}
            >
              <FaEdit />
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "1.5rem", color: "#2563eb" }}>
              {patient.nom} {patient.prenom}
            </div>
            <div style={{ color: "#64748b", fontSize: "1.1rem", margin: "8px 0" }}>{patient.email}</div>
            <div style={{ color: "#059669", fontWeight: 600, fontSize: "1.05rem" }}>
              {patient.structure}
            </div>
          </div>
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.7rem 1.5rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 8,
              boxShadow: "0 1px 4px #2563eb22",
            }}
            onClick={() => setActivePage("Messages")}
          >
            <FaComments style={{ marginRight: 8 }} /> Discuter avec l'IA
          </button>
        </div>

        {/* Colonne droite : Détails */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Infos générales */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ color: "#64748b", fontWeight: 500, marginBottom: 6 }}>Téléphone</div>
              <div style={{ fontWeight: 600, fontSize: "1.08rem" }}>{patient.telephone}</div>
            </div>
            <div style={{ minWidth: 220 }}>
              <div style={{ color: "#64748b", fontWeight: 500, marginBottom: 6 }}>ID patient</div>
              <div style={{ fontWeight: 600, fontSize: "1.08rem" }}>{patient.id_patient}</div>
            </div>
            <div style={{ minWidth: 220 }}>
              <div style={{ color: "#64748b", fontWeight: 500, marginBottom: 6 }}>Médecin traitant</div>
              <div style={{ fontWeight: 600, fontSize: "1.08rem" }}>{patient.medecin_traitant}</div>
            </div>
          </div>

          {/* Dossier médical */}
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 14,
              padding: "1.5rem 1.2rem",
              marginTop: 8,
              boxShadow: "0 1px 8px #2563eb11",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.15rem", marginBottom: 8 }}>
              Dossier médical
            </div>
            <div>
              <b style={{ color: "#64748b" }}>Antécédents :</b>{" "}
              {(patient.antecedents || []).map((a, i) => (
                <span key={i} style={{
                  background: "#e0eafc",
                  color: "#2563eb",
                  borderRadius: "1rem",
                  padding: "0.3rem 1rem",
                  fontWeight: 600,
                  fontSize: "1.02rem",
                  marginRight: 8,
                  display: "inline-block",
                }}>{a}</span>
              ))}
            </div>
            <div>
              <b style={{ color: "#64748b" }}>Traitements :</b>{" "}
              {(patient.traitements_en_cours || []).map((t, i) => (
                <span key={i} style={{
                  background: "#d1fae5",
                  color: "#059669",
                  borderRadius: "1rem",
                  padding: "0.3rem 1rem",
                  fontWeight: 600,
                  fontSize: "1.02rem",
                  marginRight: 8,
                  display: "inline-block",
                }}>{t}</span>
              ))}
            </div>
            <div>
              <b style={{ color: "#64748b" }}>Diagnostic :</b>{" "}
              <span style={{ fontWeight: 600 }}>{patient.diagnostic || "Aucun diagnostic récent"}</span>
            </div>
          </div>

          {/* Dernières consultations */}
          <div>
            <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.15rem", marginBottom: 10 }}>
              Dernières consultations
            </div>
            <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {consultationsData && consultationsData.length > 0 ? consultationsData.slice(0, 3).map((c, i) => (
                <li key={i} style={{
                  background: "#f1f5f9",
                  borderRadius: 8,
                  padding: "0.7rem 1.2rem",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "1.01rem",
                  boxShadow: "0 1px 4px #2563eb11"
                }}>
                  {c.date} — {c.type} avec {c.medecin}
                </li>
              )) : (
                <li style={{ color: "#64748b", fontWeight: 500 }}>Aucune consultation récente</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}