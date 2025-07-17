// src/pages/patient.js

import React, { useState } from "react";
import StructuresPanel from "./structures";
import ChatAI from "./chatAI";
// import structures from "./structures";
import {
  FaUserCircle,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  // FaVenusMars,
  // FaBirthdayCake,
  FaTint,
  // FaWeight,
  // FaRulerVertical,
  FaNotesMedical,
  FaUserMd,
  FaLock,
  FaArrowLeft,
  FaSignOutAlt,
  FaQuestionCircle,
  FaFileMedical,
  FaComments,
  FaHospital
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // si tu utilises react-router

// --- Palette et styles globaux ---
const colors = {
  bleu: "#3b82f6",
  vert: "#10b981",
  gris: "#f6fafe",
  grisFonce: "#f8fafc",
  grisTexte: "#64748b",
  blanc: "#fff",
};

const sidebarItems = [
  { id: "patient", label: "Ma Santé", icon: <FaUserCircle /> },
  { id: "consultations", label: "Consultations & Diagnostics", icon: <FaNotesMedical /> },
  { id: "ordonnances", label: "Ordonnances", icon: <FaFileMedical /> },
  { id: "messages", label: "Messagerie IA / Médecin", icon: <FaComments /> },
  { id: "structures", label: "Mes structures", icon: <FaHospital /> },
];

const sidebarBottom = [
  { id: "faq", label: "FAQ", icon: <FaQuestionCircle /> },
  { id: "logout", label: "Se déconnecter", icon: <FaSignOutAlt /> },
];

// --- Composants de chaque vue ---
function InfoLine({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      fontSize: "1.08rem", color: "#2563eb", marginBottom: 8
    }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <span style={{ color: "#64748b" }}>{label}:</span>
      <span style={{ fontWeight: 700, color: "#1f2937" }}>{value}</span>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{
      background: color,
      color: "#2563eb",
      borderRadius: "1rem",
      padding: "0.3rem 1rem",
      fontWeight: 600,
      fontSize: "1.02rem",
      marginRight: 8,
      marginBottom: 8,
      display: "inline-block"
    }}>{children}</span>
  );
}

function DashboardPanel({ patient, consultationsData, setActivePage }) {
  const [showPrivate, setShowPrivate] = useState(false);
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 900;

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "radial-gradient(ellipse 120% 100% at 50% 0%, #f6fafe 80%, #e0eafc 100%)",
      padding: isMobile ? "1.2rem 0.5rem" : "2.5rem 3vw",
      fontFamily: "Inter, Arial, sans-serif",
      boxSizing: "border-box",
      position: "relative"
    }}>
      {/* Grid principale */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "340px 1fr",
        gap: isMobile ? "2rem" : "3vw",
        alignItems: "start",
        width: "100%",
        marginBottom: "2.5rem"
      }}>
        {/* Profil à gauche */}
        <div style={{
          background: "#fff",
          borderRadius: "1.5rem",
          boxShadow: "0 4px 24px rgba(46,125,255,0.07)",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem"
        }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#e0eafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            color: "#3b82f6",
            boxShadow: "0 2px 12px #3b82f633",
          }}>
            <FaUserCircle />
          </div>
          <div style={{ fontWeight: 700, fontSize: "2rem", color: "#2563eb", textAlign: "center" }}>
            {patient.nom} {patient.prenom}
          </div>
        </div>
        {/* Éléments personnels à droite du profil */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          justifyContent: "center",
          alignItems: isMobile ? "center" : "flex-start",
          height: "100%",
        }}>
          <span style={{ color: "#64748b", fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
            <FaEnvelope /> {patient.email}
          </span>
          <span style={{ color: "#64748b", fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
            <FaPhone /> {patient.telephone}
          </span>
          <span style={{ color: "#64748b", fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
            <FaIdBadge /> {patient.id_patient}
          </span>
          <button
            style={{
              marginTop: 8,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "1rem",
              padding: "0.5rem 1.2rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px #3b82f633",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
            onClick={() => navigate("/edit-patient-profile")}
          >
            <FaEdit /> Modifier
          </button>
        </div>
      </div>
      {/* Carte dossier médical en dessous, sur toute la largeur */}
      <div style={{
        background: "#fff",
        borderRadius: "1.5rem",
        boxShadow: "0 4px 24px rgba(46,125,255,0.07)",
        padding: "2.5rem 2rem",
        marginBottom: "2.5rem",
        marginTop: isMobile ? "0" : "-1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
        alignItems: "flex-start" // <-- alignement à gauche
      }}>
        <div style={{ color: "#2563eb", fontWeight: 700, fontSize: "1.25rem", marginBottom: 8 }}>
          <FaNotesMedical /> Dossier médical
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Antécédents :</span>
          {(patient.antecedents || []).map((a, i) => (
            <Tag color="#e0eafc" key={i}>{a}</Tag>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Traitements :</span>
          {(patient.traitements_en_cours || []).map((t, i) => (
            <Tag color="#d1fae5" key={i}>{t}</Tag>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Médecin traitant :</span>{" "}
          <span style={{ color: "#10b981", fontWeight: 700, fontSize: "1.08rem" }}>
            <FaUserMd /> {patient.medecin_traitant}
          </span>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Notes :</span>{" "}
          <span style={{
            background: "#fef9c3",
            color: "#b45309",
            borderRadius: "1rem",
            padding: "0.3rem 1rem",
            fontWeight: 600,
            fontSize: "1.02rem",
            marginRight: 8,
            display: "inline-block",
          }}>
            {patient.notes_medecin}
          </span>
        </div>
        <button
          style={{
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            padding: "0.9rem 2rem",
            fontWeight: 600,
            fontSize: "1.15rem",
            boxShadow: "0 2px 12px #10b98133",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "background 0.2s, color 0.2s",
            marginTop: "1.5rem"
          }}
          onClick={() => setShowPrivate(true)}
        >
          <FaLock /> Infos privées
        </button>
      </div>
      {/* Bloc historiques et actions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: "2rem",
        marginBottom: "2.5rem",
        marginTop: "0.5rem"
      }}>
        {/* Diagnostic médical */}
        <div style={cardStyle()}>
          <h2 style={titleStyle()}>Diagnostic médical</h2>
          <div style={{ color: colors.grisTexte, fontSize: "1.08rem" }}>
            {patient.diagnostic || "Aucun diagnostic récent"}
          </div>
        </div>
        {/* Consultation récente */}
        <div style={cardStyle()}>
          <h2 style={titleStyle()}>Consultation récente</h2>
          <div style={{ color: colors.grisTexte, fontSize: "1.08rem" }}>
            {consultationsData[0]
              ? `${consultationsData[0].date} - ${consultationsData[0].motif} (${consultationsData[0].structure})`
              : "Aucune consultation récente"}
          </div>
        </div>
        {/* Synthèse rapide */}
        <div style={cardStyle()}>
          <h2 style={titleStyle()}>Synthèse rapide</h2>
          <div style={{ color: colors.grisTexte, fontSize: "1.08rem" }}>
            Traitements : {patient.traitements_en_cours && patient.traitements_en_cours.length > 0
              ? patient.traitements_en_cours.map((t, i) => (
                  <span key={i} style={badgeStyle(colors.vert)}>{t}</span>
                ))
              : "Aucun"}
          </div>
        </div>
      </div>
      {/* Boutons d'action sous les historiques */}
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "1.5rem",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "2.5rem"
      }}>
        <button
          style={{
            background: colors.bleu,
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            padding: "1rem 2.5rem",
            fontWeight: 700,
            fontSize: "1.15rem",
            boxShadow: "0 2px 12px #3b82f633",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "background 0.2s, color 0.2s"
          }}
          onClick={() => setActivePage("messages")}
        >
          <FaComments /> Discuter avec l'IA
        </button>
        <button
          style={{
            background: colors.vert,
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            padding: "1rem 2.5rem",
            fontWeight: 700,
            fontSize: "1.15rem",
            boxShadow: "0 2px 12px #10b98133",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "background 0.2s, color 0.2s"
          }}
          onClick={() => setActivePage("structures")}
        >
          <FaHospital /> Joindre une structure
        </button>
        <button
          style={{
            background: "#f59e42",
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            padding: "1rem 2.5rem",
            fontWeight: 700,
            fontSize: "1.15rem",
            boxShadow: "0 2px 12px #f59e4233",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "background 0.2s, color 0.2s"
          }}
          onClick={() => alert("Parler à un médecin")}
        >
          <FaUserMd /> Parler à un médecin
        </button>
      </div>
      {/* Panneau infos privées animé */}
      <AnimatePresence>
        {showPrivate && (
          <motion.div
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100vw", opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: isMobile ? "100vw" : 420,
              height: "100vh",
              background: "linear-gradient(120deg,#e0eafc 60%,#f6fafe 100%)",
              boxShadow: "-8px 0 32px #3b82f633",
              zIndex: 999,
              padding: "3rem 2rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              overflowY: "auto",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}>
              <div style={{ fontWeight: 700, fontSize: "1.25rem", color: "#2563eb" }}>
                <FaLock /> Données privées
              </div>
              <button
                style={{
                  background: "#e0eafc",
                  color: "#2563eb",
                  border: "none",
                  borderRadius: "1rem",
                  padding: "0.5rem 1.2rem",
                  fontWeight: 600,
                  fontSize: "1.08rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={() => setShowPrivate(false)}
              >
                <FaArrowLeft /> Fermer
              </button>
            </div>
            <InfoLine icon={<FaIdBadge />} label="Numéro dossier médical" value={patient.numero_dossier || "Non renseigné"} />
            <InfoLine icon={<FaTint />} label="Groupe sanguin" value={patient.groupe_sanguin} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: "#64748b", fontWeight: 500 }}>Antécédents sensibles :</span>
              {(patient.antecedents_sensibles || []).map((a, i) => (
                <Tag color="#e0eafc" key={i}>{a}</Tag>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: "#64748b", fontWeight: 500 }}>Traitements sensibles :</span>
              {(patient.traitements_sensibles || []).map((t, i) => (
                <Tag color="#d1fae5" key={i}>{t}</Tag>
              ))}
            </div>
            <InfoLine icon={<FaUserMd />} label="Médecin traitant" value={patient.medecin_traitant} />
            <div>
              <span style={{ color: "#64748b", fontWeight: 500 }}>Notes confidentielles :</span>{" "}
              <span style={{
                background: "#fef9c3",
                color: "#b45309",
                borderRadius: "1rem",
                padding: "0.3rem 1rem",
                fontWeight: 600,
                fontSize: "1.02rem",
                marginRight: 8,
                display: "inline-block",
              }}>
                {patient.notes_confidentielles}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConsultationsPanel({ consultationsData, diagnosticsIA, traitements, analyses, prochaineConsult }) {
  return (
    <motion.div
      key="consultations"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
        gap: "3rem 2rem",
        padding: "3vh 0",
      }}
    >
      <div style={cardStyle()}>
        <h2 style={titleStyle()}>Historique consultations</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {consultationsData.slice(0, 5).map((c, i) => (
            <li
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "1.5rem",
                padding: "1.1rem 0", fontSize: "1.08rem",
                borderBottom: "1px solid rgba(59,130,246,.12)",
                transition: "background .18s", cursor: "pointer",
                borderRadius: "8px", background: "transparent"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ color: "#1f2937", fontWeight: 600, minWidth: 90 }}>{c.date}</span>
              <span style={{ color: "#1f2937", flex: 1 }}>{c.motif}</span>
              <span style={{ color: colors.grisTexte, fontSize: "0.98rem", minWidth: 120 }}>{c.structure}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={cardStyle()}>
        <h2 style={titleStyle()}>Diagnostics IA</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
          {diagnosticsIA.map((d, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", gap: "0.7vh",
              borderLeft: `3px solid ${colors.bleu}`, paddingLeft: "1.2rem", borderRadius: "6px"
            }}>
              <div style={{ color: "#1f2937", fontWeight: 500, fontSize: "1.08rem" }}>
                <span style={{ color: colors.vert, fontWeight: 700 }}>Patient :</span> {d.patient}
              </div>
              <div style={{ color: colors.bleu, fontWeight: 600, fontSize: "1.08rem" }}>
                <span style={{ color: colors.bleu, fontWeight: 700 }}>IA :</span> {d.ia}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={cardStyle()}>
        <h2 style={titleStyle()}>Synthèse rapide</h2>
        <div style={{ color: "#1f2937", fontWeight: 500, fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
          Traitements prescrits :{" "}
          {traitements.map((t, i) => (
            <span key={i} style={badgeStyle(colors.vert)}>{t}</span>
          ))}
        </div>
        <div style={{ color: "#1f2937", fontWeight: 500, fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          Analyses associées :{" "}
          {analyses.map((a, i) => (
            <button
              key={i}
              type="button"
              style={{
                background: "none", border: "none", color: colors.bleu,
                textDecoration: "underline", fontWeight: 600, display: "flex",
                alignItems: "center", gap: 4, cursor: "pointer", fontSize: "1.08rem", padding: 0,
              }}
              onClick={() => alert(`Téléchargement de ${a.nom}`)}
            >
              📄 {a.nom}
            </button>
          ))}
        </div>
      </div>
      <div style={cardStyle()}>
        <h2 style={titleStyle()}>Prochaine consultation</h2>
        {prochaineConsult && prochaineConsult.date ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "1.2rem",
            fontSize: "1.08rem", fontWeight: 500, color: "#1f2937"
          }}>
            <span style={badgeStyle(colors.vert)}>{prochaineConsult.date}</span>
            <span>
              rendez-vous avec <span style={{ color: colors.bleu, fontWeight: 700 }}>{prochaineConsult.medecin}</span>
            </span>
          </div>
        ) : (
          <div style={{ color: colors.grisTexte, fontWeight: 500, fontSize: "1.08rem" }}>
            Aucun rendez-vous planifié
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OrdonnancesPanel({ ordonnances }) {
  return (
    <motion.div
      key="ordonnances"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "flex", flexDirection: "column", gap: "3vh",
        padding: "3vh 0",
      }}
    >
      <h2 style={titleStyle()}>Mes ordonnances</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {ordonnances.map(o => (
          <li key={o.id} style={{
            display: "flex", alignItems: "center", gap: "1.2rem",
            padding: "1.1rem 0", fontSize: "1.08rem",
            borderBottom: "1px solid rgba(59,130,246,.12)",
            transition: "background .18s", cursor: "pointer",
            borderRadius: "8px", background: "transparent"
          }}>
            <span style={{ color: "#1f2937", fontWeight: 600 }}>{o.date}</span>
            <span style={{ color: "#1f2937" }}>{o.medicaments}</span>
            <span style={{ color: o.statut === "En cours" ? colors.vert : colors.grisTexte, fontWeight: 600 }}>{o.statut}</span>
            <span style={{ color: colors.grisTexte, fontSize: "0.95rem" }}>{o.structure}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// function MessagesPanel() {
//   return (
//     <motion.div
//       key="messages"
//       initial={{ opacity: 0, x: 60 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -60 }}
//       transition={{ duration: 0.35, ease: "easeOut" }}
//       style={{
//         display: "flex", flexDirection: "column", gap: "3vh",
//         padding: "3vh 0",
//       }}
//     >
//       <h2 style={titleStyle()}>Messagerie IA / Médecin</h2>
//       <div style={{
//         background: colors.grisFonce,
//         borderRadius: "1rem",
//         padding: "2rem",
//         color: colors.grisTexte,
//         fontSize: "1.08rem",
//         minHeight: 120,
//         boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
//       }}>
//         (Zone de messagerie IA/médecin à intégrer)
//       </div>
//     </motion.div>
//   );
// }

// function StructuresPanel() {
//   return (
//     <motion.div
//       key="structures"
//       initial={{ opacity: 0, x: 60 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -60 }}
//       transition={{ duration: 0.35, ease: "easeOut" }}
//       style={{
//         display: "flex", flexDirection: "column", gap: "3vh",
//         padding: "3vh 0",
//       }}
//     >
//       <h2 style={titleStyle()}>Mes structures médicales</h2>
//       <div style={{
//         background: colors.grisFonce,
//         borderRadius: "1rem",
//         padding: "2rem",
//         color: colors.grisTexte,
//         fontSize: "1.08rem",
//         minHeight: 120,
//         boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
//       }}>
//         (Liste des établissements partenaires à intégrer)
//       </div>
//     </motion.div>
//   );
// }

// --- Fonctions utilitaires de style ---
function cardStyle() {
  return {
    background: colors.blanc,
    borderRadius: "1.5rem",
    boxShadow: "0 4px 24px rgba(46,125,255,0.07)",
    padding: "2.5rem 2rem",
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    justifyContent: "flex-start",
  };
}
function titleStyle() {
  return {
    color: colors.bleu,
    fontWeight: 700,
    fontSize: "1.25rem",
    marginBottom: "1.2rem",
    letterSpacing: ".5px"
  };
}
function badgeStyle(bg) {
  return {
    background: bg,
    color: "#fff",
    borderRadius: "0.7rem",
    padding: "0.3rem 1rem",
    fontWeight: 600,
    fontSize: "1.05rem",
    boxShadow: "0 2px 8px rgba(16,185,129,0.09)",
    marginRight: "0.7rem"
  };
}

// --- Composant principal PatientPage ---
export default function PatientPage() {
  // Données fictives pour la démo
  const [activePage, setActivePage] = useState("patient");
  // const navigate = useNavigate(); // Ajoute cette ligne ici

  const [patient] = useState({
    nom: "Elie",
    prenom: "Yao",
    age: 32,
    email: "elie.yao@email.com",
    sexe: "Homme",
    symptomes: "Fatigue, toux",
    diagnostic: "Grippe saisonnière",
    traitements_en_cours: ["Paracétamol", "Ibuprofène"],
    medecin_traitant: "Dr. Koné",
  });
  const consultationsData = [
    { date: "01/07/2025", motif: "Toux", structure: "CHR de Cocody" },
    { date: "15/06/2025", motif: "Maux de tête", structure: "Clinique Sainte-Marie" },
    { date: "02/06/2025", motif: "Fièvre", structure: "Polyclinique du Plateau" },
    { date: "20/05/2025", motif: "Douleurs abdominales", structure: "Hôpital Général" },
    { date: "10/05/2025", motif: "Fatigue", structure: "Centre Médical Yopougon" },
  ];
  const diagnosticsIA = [
    { patient: "J’ai mal au dos", ia: "Voici les causes possibles : fatigue, mauvaise posture, etc." },
    { patient: "Fièvre persistante", ia: "Infection virale probable, consultez un médecin." },
  ];
  const traitements = ["Paracétamol", "Ibuprofène"];
  const analyses = [{ nom: "Tension 12/8", fichier: "analyse_123.pdf" }];
  const prochaineConsult = { date: "23 juillet à 10h", medecin: "Dr. Koné" };
  const ordonnances = [
    { id: 1, date: "01/07/2025", medicaments: "Paracétamol", statut: "En cours", structure: "CHR de Cocody" },
    { id: 2, date: "15/06/2025", medicaments: "Ibuprofène", statut: "Terminé", structure: "Clinique Sainte-Marie" },
  ];

  // --- Gestion de la déconnexion ---
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  // --- Rendu centralisé des vues ---
  function renderMainContent() {
    switch (activePage) {
      case "patient":
        return <DashboardPanel patient={patient} consultationsData={consultationsData} setActivePage={setActivePage} />;
      case "consultations":
        return <ConsultationsPanel consultationsData={consultationsData} diagnosticsIA={diagnosticsIA} traitements={traitements} analyses={analyses} prochaineConsult={prochaineConsult} />;
      case "ordonnances":
        return <OrdonnancesPanel ordonnances={ordonnances} />;
      case "messages":
        return <ChatAI />; // Affiche le chat ici
      case "structures":
        return <StructuresPanel colors={colors} titleStyle={titleStyle} />;
      case "faq":
        return (
          <motion.div
            key="faq"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={cardStyle()}
          >
            <h2 style={titleStyle()}>FAQ</h2>
            <div style={{ color: colors.grisTexte, fontSize: "1.08rem" }}>
              (Section d’aide et de questions fréquentes à intégrer)
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  }

  // --- Responsive sidebar ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = window.innerWidth < 900;

  return (
    <div style={{
      display: "flex",
      alignItems: "stretch", // <-- Ajouté
      minHeight: "100vh",
      background: colors.gris,
      fontFamily: "Inter, Segoe UI, Arial, sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? (isMobile ? 70 : 260) : (isMobile ? 0 : 260),
        minWidth: sidebarOpen ? (isMobile ? 70 : 260) : 0,
        background: `linear-gradient(180deg,#e0eafc 0%,${colors.grisFonce} 100%)`,
        boxShadow: "2px 0 16px rgba(46,125,255,0.07)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        transition: "width .25s",
        zIndex: 100,
        minHeight: "100vh",
        height: "auto",
        overflow: "hidden", // pas de scroll global ici
      }}>
        {/* Logo et bienvenue */}
        <div style={{
          padding: isMobile ? "1.2rem 0.5rem" : "2rem 1.2rem",
          borderBottom: "1px solid #e0eafc",
          display: "flex",
          flexDirection: "column",
          alignItems: isMobile ? "center" : "flex-start",
          gap: "0.7rem"
        }}>
          <span style={{
            fontWeight: 800,
            fontSize: isMobile ? "1.5rem" : "2rem",
            color: colors.bleu,
            letterSpacing: "1px"
          }}>
            santeAI
          </span>
          <span style={{
            fontWeight: 500,
            fontSize: isMobile ? "1rem" : "1.08rem",
            color: colors.grisTexte
          }}>
            Bienvenue {patient.nom}
          </span>
        </div>

        {/* Top menu */}
        <nav style={{
          padding: isMobile ? "1.2rem 0.5rem" : "2.5rem 1.2rem",
          flex: 1,
          overflowY: "auto", // scroll vertical pour le menu
          height: "100%",
          maxHeight: "calc(100vh - 180px)", // ajuste selon la hauteur du header/bottom
        }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sidebarItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? 0 : "1rem",
                      background: isActive ? colors.vert : "none",
                      color: isActive ? "#fff" : colors.bleu,
                      fontWeight: 600,
                      fontSize: isMobile ? "1.6rem" : "1.08rem",
                      padding: isMobile ? "1.1rem 0.5rem" : "0.8rem 1.2rem",
                      borderRadius: "12px",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 2px 12px #10b98133" : "none",
                      border: "none",
                      transition: "background 0.2s, color 0.2s",
                      justifyContent: isMobile ? "center" : "flex-start",
                      position: "relative",
                    }}
                    onClick={() => {
                      setActivePage(item.id);
                    }}
                  >
                    <span style={{
                      fontSize: isMobile ? "2rem" : "1.35rem",
                      color: isActive ? "#fff" : colors.bleu,
                      transition: "color 0.2s"
                    }}>
                      {item.icon}
                    </span>
                    {!isMobile && <span style={{ marginLeft: 4 }}>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Bottom menu */}
        <div style={{
          padding: isMobile ? "1rem 0.5rem" : "2rem 1.2rem",
          borderTop: "1px solid #e0eafc",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          {sidebarBottom.map(item => (
            <button
              key={item.id}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 0 : "1rem",
                background: activePage === item.id ? colors.vert : "none",
                color: activePage === item.id ? "#fff" : colors.bleu,
                fontWeight: 600,
                fontSize: isMobile ? "1.6rem" : "1.08rem",
                padding: isMobile ? "1.1rem 0.5rem" : "0.8rem 1.2rem",
                borderRadius: "12px",
                cursor: "pointer",
                boxShadow: activePage === item.id ? "0 2px 12px #10b98133" : "none",
                border: "none",
                transition: "background 0.2s, color 0.2s",
                justifyContent: isMobile ? "center" : "flex-start",
                position: "relative",
              }}
              onClick={() => {
                if (item.id === "logout") handleLogout();
                else setActivePage(item.id);
              }}
            >
              <span style={{
                fontSize: isMobile ? "2rem" : "1.35rem",
                color: activePage === item.id ? "#fff" : colors.bleu,
                transition: "color 0.2s"
              }}>
                {item.icon}
              </span>
              {!isMobile && <span style={{ marginLeft: 4 }}>{item.label}</span>}
            </button>
          ))}
        </div>
        {/* Sidebar toggle (mobile) */}
        {isMobile && (
          <button
            style={{
              position: "absolute",
              top: 12,
              right: -38,
              background: colors.vert,
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 38,
              height: 38,
              boxShadow: "0 2px 8px #10b98133",
              cursor: "pointer",
              fontSize: "1.5rem",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Réduire le menu" : "Ouvrir le menu"}
          >
            {sidebarOpen ? "←" : "☰"}
          </button>
        )}
        {/* Séparation fine */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 4,
          height: "100%",
          background: "linear-gradient(180deg,#10b981 0%,#3b82f6 100%)",
          opacity: 0.12,
          borderRadius: "0 8px 8px 0",
          boxShadow: "0 0 16px #10b98122",
        }} />
      </aside>
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: isMobile ? "1.5rem 0.5rem" : "3rem 3vw",
          background: colors.gris,
          minHeight: "100vh",
          transition: "padding .2s",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          position: "relative",
          overflowY: activePage === "messages" ? "visible" : "auto", // scroll sauf pour Messagerie IA / Médecin
          height: "100vh",
        }}
      >
        <AnimatePresence mode="wait">
          {renderMainContent()}
        </AnimatePresence>
      </main>
    </div>
  );
}