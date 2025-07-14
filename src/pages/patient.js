import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaUserCircle, FaHeartbeat, FaNotesMedical, FaFileMedical, FaChartLine, FaComments,
  FaBell, FaUpload, FaStethoscope, FaCalendarAlt, FaHospital,
  FaLock, FaUserMd, FaTint, FaChevronLeft, FaEdit,
  FaVideo, FaUserCog, FaLifeRing, FaSignOutAlt
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

// Composant principal Patient
export default function Patient() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("patient");

  // Récupère les données du patient transmises par le backend
  const patient = location.state?.patient || {};

  // Données fictives pour l'exemple
  const etatSante = {
    symptomes: "Fièvre, toux",
    diagnostic: "Grippe saisonnière",
    gravite: "Modérée",
    date: "07/07/2025",
  };
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
  const notifications = [
    { id: 1, texte: "Prendre Paracétamol à 20h", type: "medicament" },
    { id: 2, texte: "RDV demain à 10h", type: "rdv" },
  ];

  const colors = {
    bleu: "#2e7dff",
    vert: "#38b6ff",
    blanc: "#fff",
    gris: "#f7f7f8",
    grisFonce: "#e0eafc",
    texte: "#222",
    accent: "#38b6ff",
  };

  const styles = {
    root: {
      fontFamily: "Segoe UI, Arial, sans-serif",
      background: colors.gris,
      minHeight: "100vh",
      padding: "0",
      margin: "0",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "2rem",
    },
    structureHeader: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      background: colors.blanc,
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
      padding: "1rem 2rem",
      fontWeight: 700,
      color: colors.bleu,
      fontSize: "1.15rem",
    },
    profilBloc: {
      background: colors.blanc,
      borderRadius: "18px",
      boxShadow: "0 2px 16px rgba(46,125,255,0.08)",
      padding: "2.5rem 2.5rem",
      marginBottom: "2.5rem",
      width: "100%",
      maxWidth: 1100,
      minWidth: 260,
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
      position: "relative",
      overflow: "visible",
      minHeight: 320,
    },
    photo: {
      width: 96,
      height: 96,
      borderRadius: "50%",
      background: colors.grisFonce,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "3.5rem",
      color: colors.bleu,
      objectFit: "cover",
      marginBottom: 18,
      overflow: "hidden",
      boxShadow: "0 4px 16px #2e7dff22, 0 0 0 4px #e0eafc",
      backgroundClip: "padding-box",
    },
    profilNom: {
      fontWeight: 700,
      fontSize: "1.5rem",
      color: colors.bleu,
      marginBottom: 2,
      letterSpacing: ".5px"
    },
    profilId: {
      color: "#64748b",
      fontSize: "1.02rem",
      marginBottom: 2,
    },
    profilLigne: {
      fontSize: "1.08rem",
      color: colors.texte,
      display: "flex",
      gap: "1.2rem",
      flexWrap: "wrap",
    },
    profilLabel: {
      color: "#64748b",
      minWidth: 110,
      fontWeight: 500,
    },
    profilBtn: {
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "0.9rem 2.2rem",
      fontWeight: 700,
      fontSize: "1.15rem",
      marginTop: "2.5rem",
      boxShadow: "0 4px 16px #2e7dff33",
      cursor: "pointer",
      transition: "background 0.2s, box-shadow 0.2s",
      alignSelf: "center",
      minWidth: 220,
      position: "absolute",
      left: "50%",
      bottom: "-2.2rem",
      transform: "translateX(-50%)",
    },
    etatSante: {
      background: colors.blanc,
      borderRadius: "14px",
      boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
      padding: "1.5rem 2rem",
      display: "flex",
      alignItems: "center",
      gap: "2.5rem",
      flexWrap: "wrap",
    },
    etatBloc: {
      flex: 1,
      minWidth: "220px",
    },
    etatTitre: {
      fontWeight: 700,
      color: colors.bleu,
      marginBottom: "0.7rem",
      fontSize: "1.1rem",
    },
    etatValeur: {
      fontSize: "1.05rem",
      marginBottom: "0.3rem",
    },
    gravite: {
      fontWeight: 700,
      color: "#e53e3e",
      fontSize: "1.1rem",
    },
    sections: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
      gap: "2rem",
    },
    section: {
      background: colors.blanc,
      borderRadius: "14px",
      boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
      padding: "1.5rem 1.3rem",
      minHeight: "220px",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    sectionTitle: {
      fontWeight: 700,
      color: colors.bleu,
      fontSize: "1.15rem",
      marginBottom: "0.7rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    list: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      fontSize: "1rem",
    },
    listItem: {
      padding: "0.5rem 0",
      borderBottom: "1px solid #f0f0f0",
      cursor: "pointer",
      transition: "background 0.15s",
      display: "flex",
      flexDirection: "column",
      gap: "0.2rem",
    },
    ordonnanceStatut: {
      fontWeight: 600,
      color: colors.bleu,
      marginLeft: "0.7rem",
    },
    ordonnanceStructure: {
      color: "#888",
      fontSize: "0.95rem",
      marginLeft: "0.5rem",
    },
    graph: {
      width: "100%",
      height: "120px",
      background: "linear-gradient(90deg, #e0eafc 60%, #f7f7f8 100%)",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: colors.bleu,
      fontWeight: 600,
      fontSize: "1.2rem",
      marginTop: "0.7rem",
    },
    actions: {
      display: "flex",
      gap: "1.2rem",
      marginTop: "1.5rem",
      flexWrap: "wrap",
    },
    actionBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.7rem",
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "0.9rem 1.3rem",
      fontWeight: 600,
      fontSize: "1.08rem",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(46,125,255,0.08)",
      transition: "background 0.2s",
    },
    upload: {
      marginTop: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.7rem",
    },
    notif: {
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      background: "#e0eafc",
      color: colors.bleu,
      borderRadius: "8px",
      padding: "0.7rem 1rem",
      fontWeight: 500,
      fontSize: "1rem",
      marginBottom: "0.5rem",
    },
    messagerie: {
      background: "#f7f7f8",
      borderRadius: "10px",
      padding: "1rem",
      minHeight: "80px",
      marginTop: "0.5rem",
      fontSize: "1rem",
      color: "#222",
      border: "1px solid #e0eafc",
    },
    menuBtn: {
      background: "none",
      border: "none",
      color: colors.bleu,
      fontSize: "1rem",
      fontWeight: 500,
      padding: "0.8rem 1.2rem",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
  };

  function ProfilPatient({ patient }) {
    const [showPrive, setShowPrive] = useState(false);
    const [traitAnime, setTraitAnime] = useState(false);

    const handleShowPrive = () => {
      setTraitAnime(true);
      setTimeout(() => setShowPrive(true), 350);
    };
    const handleClosePrive = () => {
      setShowPrive(false);
      setTimeout(() => setTraitAnime(false), 350);
    };

    const isMobile = window.innerWidth < 900;

    return (
      <div style={{
        background: "#fff",
        borderRadius: "18px",
        boxShadow: "0 2px 16px rgba(46,125,255,0.08)",
        padding: "1.5rem 1.2rem",
        marginBottom: "2rem",
        width: "100%",
        maxWidth: 1100,
        minWidth: 260,
        display: isMobile ? "block" : "flex",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        overflow: "visible",
        minHeight: 320,
      }}>
        {/* Colonne gauche */}
        <div style={{
          flex: "0 0 35%",
          maxWidth: isMobile ? "100%" : "260px",
          minWidth: 0,
          background: "#fff",
          borderRadius: isMobile ? "18px 18px 0 0" : "18px 0 0 18px",
          boxShadow: "0 4px 32px #3b82f611",
          padding: isMobile ? "2rem 1rem" : "2.5rem 1.5rem 2.5rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
          margin: isMobile ? "2rem 0 0 0" : "0"
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#e0eafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.2rem",
            color: "#3b82f6",
            objectFit: "cover",
            marginBottom: 14,
            overflow: "hidden",
            boxShadow: "0 4px 16px #2e7dff22, 0 0 0 4px #e0eafc",
            position: "relative"
          }}>
            {patient.photo ? (
              <img src={patient.photo} alt="Profil" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            ) : (
              <FaUserCircle />
            )}
            <button
              onClick={() => navigate("/profile/edit")}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "#e0eafc",
                color: "#2563eb",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px #2e7dff22",
                cursor: "pointer",
                fontSize: "1rem",
                padding: 0,
                zIndex: 3
              }}
              title="Modifier mon profil"
            >
              <FaEdit />
            </button>
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#2563eb", marginBottom: 2, letterSpacing: ".5px" }}>
            {patient.nom || "Nom Prénom"}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: 2 }}>
            ID patient : <b>{patient.id || "N/A"}</b>
          </div>
          <div style={{ fontSize: "0.98rem", color: "#222", margin: "1rem 0 0.2rem 0" }}>
            <span style={{ color: "#64748b", minWidth: 110, fontWeight: 500 }}>Âge :</span> <b>{patient.age || "--"}</b>
          </div>
          <div style={{ fontSize: "0.98rem", color: "#222" }}>
            <span style={{ color: "#64748b", minWidth: 110, fontWeight: 500 }}>Sexe :</span> <b>{patient.sexe || "--"}</b>
          </div>
          <div style={{ fontSize: "0.98rem", color: "#222" }}>
            <span style={{ color: "#64748b", minWidth: 110, fontWeight: 500 }}>Téléphone :</span> <b>{patient.telephone || "--"}</b>
          </div>
          <div style={{ fontSize: "0.98rem", color: "#222" }}>
            <span style={{ color: "#64748b", minWidth: 110, fontWeight: 500 }}>E-mail :</span> <b>{patient.email || "--"}</b>
          </div>
        </div>

        {/* Trait central animé avancé à 2/3 */}
        <motion.div
          initial={false}
          animate={{
            scaleY: showPrive ? 0 : 1,
            scaleX: showPrive ? 0.7 : 1,
            opacity: traitAnime ? 0.2 : 1
          }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            position: "absolute",
            left: isMobile ? 0 : "66.666%", // 2/3 de la largeur
            top: isMobile ? "35%" : 0,
            width: isMobile ? "100%" : "8px",
            height: isMobile ? "8px" : "100%",
            background: "linear-gradient(120deg, #3b82f6 0%, #10b981 100%)",
            borderRadius: "8px",
            boxShadow: "0 0 16px 2px #38b6ff55",
            zIndex: 10,
            opacity: 0.9,
            transition: "all .4s cubic-bezier(.77,0,.18,1)",
          }}
        />

        {/* Colonne droite dynamique */}
        <div style={{
          flex: "1 1 65%",
          minWidth: 0,
          background: "#fff",
          borderRadius: isMobile ? "0 0 18px 18px" : "0 18px 18px 0",
          boxShadow: "0 4px 32px #3b82f611",
          padding: isMobile ? "2rem 1rem" : "2.5rem 2.5rem 2.5rem 1.5rem",
          margin: isMobile ? "0 0 2rem 0" : "0",
          position: "relative",
          minHeight: 260,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <AnimatePresence mode="wait">
            {!showPrive ? (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 60, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
                style={{ width: "100%", minHeight: 220, position: "relative", height: "100%" }}
              >
                {/* Contenu principal de la colonne droite */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", height: "100%" }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#3b82f6", marginBottom: 8 }}>
                    Informations médicales
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "1rem" }}>
                    <span><FaTint style={{ color: "#10b981", marginRight: 6 }} /> Groupe sanguin : <b>{patient.groupeSanguin || "--"}</b></span>
                    {/* Ajoute ici d'autres infos si besoin */}
                  </div>
                  {/* Bouton Info privé en bas à droite */}
                  <button
                    style={{
                      background: "#e0eafc",
                      color: "#2563eb",
                      border: "none",
                      borderRadius: 10,
                      padding: "0.55rem 1.1rem",
                      fontWeight: 600,
                      fontSize: "1rem",
                      boxShadow: "0 2px 8px #2e7dff22",
                      cursor: "pointer",
                      minWidth: 0,
                      maxWidth: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      position: "absolute",
                      right: 18,
                      bottom: 18,
                      transition: "background 0.2s, box-shadow 0.2s"
                    }}
                    onClick={handleShowPrive}
                    disabled={showPrive}
                  >
                    <FaLock style={{ marginRight: 6 }} />
                    Info privé
                  </button>
                </div>
              </motion.div>
            ) : (
              <PrivateInfoPanel
                key="prive"
                patient={patient}
                onClose={handleClosePrive}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Composant pour la zone privée dynamique
  function PrivateInfoPanel({ patient, onClose }) {
    const antecedents = patient.antecedents || ["Asthme"];
    const traitements = patient.traitements || ["Paracétamol"];
    const notes = patient.notes || "";

    return (
      <motion.div
        initial={{ x: 80, opacity: 0, scale: 0.98 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 80, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={{
          background: "#fff",
          borderRadius: "1.5rem",
          boxShadow: "0 4px 32px #3b82f611",
          padding: "2.5rem 2rem",
          minHeight: 340,
          position: "relative",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}
      >
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            position: "absolute",
            left: -18,
            top: 32,
            width: 8,
            height: "80%",
            background: "linear-gradient(180deg,#3b82f6 60%,#10b981 100%)",
            borderRadius: 8,
            boxShadow: "0 0 12px #3b82f633",
            zIndex: 1,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FaLock color="#3b82f6" size={22} />
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "#3b82f6" }}>
            Données privées et personnelles
          </span>
        </div>
        {/* Remplacement du numéro de sécurité sociale par une autre info */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Numéro de dossier médical :</span>
          <span style={{
            fontFamily: "monospace",
            fontSize: "1.18rem",
            letterSpacing: "2px",
            background: "#f8fafc",
            padding: "0.4rem 1.1rem",
            borderRadius: "0.7rem",
            border: "1.5px solid #e0eafc",
            userSelect: "none"
          }}>
            {patient.id || "P-0001"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Groupe sanguin :</span>
          <span style={{ fontWeight: 700, color: "#10b981", fontSize: "1.15rem" }}>
            {patient.groupeSanguin || "--"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Antécédents médicaux :</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {antecedents.length > 0
              ? antecedents.map((a, i) => (
                <span key={i} style={{
                  background: "#e0eafc",
                  color: "#2563eb",
                  borderRadius: "0.7rem",
                  padding: "0.3rem 1rem",
                  fontWeight: 600,
                  fontSize: "1.05rem"
                }}>{a}</span>
              ))
              : <span style={{ color: "#888" }}>Aucun</span>
            }
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Traitements en cours :</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {traitements.length > 0
              ? traitements.map((t, i) => (
                <span key={i} style={{
                  background: "#d1fae5",
                  color: "#059669",
                  borderRadius: "0.7rem",
                  padding: "0.3rem 1rem",
                  fontWeight: 600,
                  fontSize: "1.05rem"
                }}>{t}</span>
              ))
              : <span style={{ color: "#888" }}>Aucun</span>
            }
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Médecin traitant :</span>
          <span style={{ color: "#2563eb", fontWeight: 600 }}>
            <FaUserMd style={{ marginRight: 6 }} />
            {patient.medecinTraitant || "--"}
          </span>
        </div>
        {notes && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
            <span style={{ color: "#64748b", fontWeight: 600, minWidth: 170 }}>Notes confidentielles :</span>
            <span style={{
              background: "#fef9c3",
              color: "#b45309",
              borderRadius: "0.7rem",
              padding: "0.5rem 1.2rem",
              fontWeight: 500,
              fontSize: "1.08rem"
            }}>{notes}</span>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "#e0eafc",
            color: "#3b82f6",
            border: "none",
            borderRadius: 8,
            padding: "0.4rem 1rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          <FaChevronLeft style={{ marginRight: 6 }} />
          Fermer
        </button>
      </motion.div>
    );
  }

  function ConsultationsPanel() {
    return (
      <motion.div
        initial={{ opacity: 0, x: 60, skewX: 4 }}
        animate={{ opacity: 1, x: 0, skewX: 0 }}
        exit={{ opacity: 0, x: 60, skewX: 4 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          background: "radial-gradient(ellipse 120% 100% at 50% 0%, #f6fafe 80%, #fff 100%)",
          minHeight: "70vh",
          padding: "6vh 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
          gap: "6vh 2rem",
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        }}
      >
        {/* Bloc 1 : Historique consultations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ fontWeight: 700, fontSize: "1.35rem", color: "#3b82f6", marginBottom: "1.2vh", letterSpacing: ".5px" }}>
            Consultations récentes
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            {consultationsData.slice(0, 5).map((c, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  padding: "1.1rem 0",
                  fontSize: "1.08rem",
                  borderBottom: "1px solid rgba(59,130,246,.12)",
                  borderRadius: "8px",
                  transition: "background .18s",
                  cursor: "pointer",
                  background: "transparent",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ color: "#1f2937", fontWeight: 600, minWidth: 90 }}>{c.date}</span>
                <span style={{ color: "#1f2937", flex: 1 }}>{c.motif}</span>
                <span style={{ color: "#64748b", fontSize: "0.98rem", minWidth: 120 }}>{c.structure}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bloc 2 : Diagnostics IA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ fontWeight: 700, fontSize: "1.35rem", color: "#3b82f6", marginBottom: "1.2vh", letterSpacing: ".5px" }}>
            Derniers diagnostics IA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            {diagnosticsIA.map((d, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.7vh",
                borderLeft: "3px solid #3b82f6",
                paddingLeft: "1.2rem",
                background: "transparent",
                borderRadius: "6px",
              }}>
                <div style={{
                  color: "#1f2937",
                  fontWeight: 500,
                  fontSize: "1.08rem",
                  marginBottom: "0.2vh"
                }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>Patient :</span> {d.patient}
                </div>
                <div style={{
                  color: "#3b82f6",
                  fontWeight: 600,
                  fontSize: "1.08rem",
                  background: "transparent"
                }}>
                  <span style={{ color: "#3b82f6", fontWeight: 700 }}>IA :</span> {d.ia}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloc 3 : Synthèse rapide */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ fontWeight: 700, fontSize: "1.35rem", color: "#3b82f6", marginBottom: "1.2vh", letterSpacing: ".5px" }}>
            Synthèse rapide
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ color: "#1f2937", fontWeight: 500, fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
              Traitements prescrits :{" "}
              {traitements.map((t, i) => (
                <span key={i} style={{
                  background: "#e0eafc",
                  color: "#10b981",
                  borderRadius: "0.7rem",
                  padding: "0.3rem 1rem",
                  fontWeight: 600,
                  marginRight: "0.7rem"
                }}>{t}</span>
              ))}
            </div>
            <div style={{ color: "#1f2937", fontWeight: 500, fontSize: "1.08rem", display: "flex", alignItems: "center", gap: 8 }}>
              Analyses associées :{" "}
              {analyses.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    textDecoration: "underline",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    fontSize: "1.08rem",
                    padding: 0,
                  }}
                  onClick={() => alert(`Téléchargement de ${a.nom}`)}
                >
                  📄 {a.nom}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bloc 4 : Prochaine consultation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div style={{ fontWeight: 700, fontSize: "1.35rem", color: "#3b82f6", marginBottom: "1.2vh", letterSpacing: ".5px" }}>
            Prochaine consultation
          </div>
          {prochaineConsult && prochaineConsult.date ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              fontSize: "1.08rem",
              fontWeight: 500,
              color: "#1f2937"
            }}>
              <span style={{
                background: "#d1fae5",
                color: "#10b981",
                borderRadius: "0.7rem",
                padding: "0.3rem 1.1rem",
                fontWeight: 700,
                fontSize: "1.08rem"
              }}>
                {prochaineConsult.date}
              </span>
              <span>
                rendez-vous avec <span style={{ color: "#3b82f6", fontWeight: 700 }}>{prochaineConsult.medecin}</span>
              </span>
            </div>
          ) : (
            <div style={{
              color: "#64748b",
              fontWeight: 500,
              fontSize: "1.08rem"
            }}>
              Aucun rendez-vous planifié
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const sidebarItems = [
    { label: "Ma Santé", route: "patient", icon: <FaHeartbeat /> },
    { label: "Consultations & Diagnostics", route: "consultations", icon: <FaNotesMedical />, badge: 2 },
    { label: "Ordonnances & Analyses", route: "ordonnances", icon: <FaFileMedical /> },
    { label: "Mes documents médicaux", route: "documents", icon: <FaUpload /> },
    { label: "Messagerie IA / Médecin", route: "messages", icon: <FaComments />, badge: "•" },
    { label: "Téléconsultations", route: "teleconsultations", icon: <FaVideo /> },
    { label: "Mes Structures", route: "structures", icon: <FaHospital /> },
    { label: "Agenda & Rappels", route: "agenda", icon: <FaCalendarAlt /> },
    { label: "Mon évolution santé", route: "suivi", icon: <FaChartLine /> },
    { label: "Notifications", route: "notifications", icon: <FaBell /> },
    { label: "Données privées", route: "profile/private", icon: <FaLock /> },
    { label: "Paramètres du compte", route: "settings", icon: <FaUserCog /> },
    { label: "Aide & FAQ", route: "help", icon: <FaLifeRing /> },
    { label: "Se déconnecter", route: "login", icon: <FaSignOutAlt />, action: "logout" }
  ];

  return (
    <div style={{ ...styles.root, display: "flex", minHeight: "100vh" }}>
      {/* Menu latéral à gauche */}
      <aside
        style={{
          width: 260,
          minWidth: 80,
          background: "linear-gradient(180deg,#e0eafc 0%,#f6fafe 100%)",
          backdropFilter: "blur(16px)",
          borderRight: "1px solid #e0eafc",
          boxShadow: "2px 0 12px rgba(46,125,255,0.04)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "2rem 1rem"
        }}
      >
        <div style={{ fontWeight: 700, color: "#2e7dff", fontSize: "1.2rem", marginBottom: "1rem" }}>
          Menu
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: 4,
            scrollbarWidth: "thin"
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sidebarItems.map((item) => {
              const isActive = activePage === item.route;
              return (
                <li key={item.label} style={{ position: "relative" }}>
                  <button
                    className={isActive ? "menu--active" : ""}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      background: "none",
                      border: "none",
                      color: isActive ? "#fff" : "#3b82f6",
                      fontWeight: 500,
                      fontSize: "1.08rem",
                      padding: "0.8rem 1.2rem",
                      borderRadius: "12px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s, color 0.2s",
                      boxShadow: isActive ? "0 2px 8px #e0eafc" : "none"
                    }}
                    onClick={() => {
                      if (item.action === "logout") {
                        localStorage.clear();
                        navigate("/login");
                      } else {
                        setActivePage(item.route); // <-- c'est tout !
                      }
                    }}
                  >
                    {/* Indicateur vertical actif */}
                    {isActive && (
                      <span style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: 4,
                        background: "linear-gradient(180deg,#3b82f6 0%,#10b981 100%)",
                        borderRadius: "4px",
                        transition: "transform .2s",
                      }} />
                    )}
                    <span style={{ fontSize: "1.35rem", minWidth: 28 }}>{item.icon}</span>
                    <span style={{ marginLeft: 4 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        position: "absolute",
                        right: 16,
                        top: 12,
                        fontSize: "0.85rem",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "999px",
                        minWidth: 20,
                        height: 20,
                        display: "grid",
                        placeContent: "center",
                        fontWeight: 700,
                        boxShadow: "0 2px 8px #ef444422"
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Contenu principal à droite */}
      <div style={{ flex: 1 }}>
        <div style={styles.container}>
          <AnimatePresence mode="wait">
            {activePage === "consultations" ? (
              <ConsultationsPanel key="consultations" />
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 60, skewX: 4 }}
                animate={{ opacity: 1, x: 0, skewX: 0 }}
                exit={{ opacity: 0, x: 60, skewX: 4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <ProfilPatient patient={patient} />
                {/* Etat de santé */}
                <div style={styles.etatSante}>
                  <div style={styles.etatBloc}>
                    <div style={styles.etatTitre}><FaNotesMedical /> Symptômes récents</div>
                    <div style={styles.etatValeur}>{etatSante.symptomes}</div>
                  </div>
                  <div style={styles.etatBloc}>
                    <div style={styles.etatTitre}><FaStethoscope /> Diagnostic IA</div>
                    <div style={styles.etatValeur}>{etatSante.diagnostic}</div>
                    <div style={styles.gravite}>Gravité : {etatSante.gravite}</div>
                  </div>
                  <div style={styles.etatBloc}>
                    <div style={styles.etatTitre}><FaCalendarAlt /> Dernière MAJ</div>
                    <div style={styles.etatValeur}>{etatSante.date}</div>
                  </div>
                </div>

                {/* Sections principales */}
                <div style={styles.sections}>
                  {/* Consultations */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}><FaNotesMedical /> Mes consultations</div>
                    <ul style={styles.list}>
                      {consultationsData.slice(0, 5).map((c, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1.2rem",
                            padding: "1.1rem 0",
                            fontSize: "1.08rem",
                            borderBottom: "1px solid rgba(59,130,246,.12)",
                            transition: "background .18s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,.05)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ color: "#1f2937", fontWeight: 600 }}>{c.date}</span>
                          <span style={{ color: "#1f2937" }}>{c.motif}</span>
                          <span style={{ color: "#64748b", fontSize: "0.98rem" }}>{c.structure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Ordonnances */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}><FaFileMedical /> Mes ordonnances</div>
                    <ul style={styles.list}>
                      {ordonnances.map(o => (
                        <li key={o.id} style={styles.listItem}>
                          <b>{o.date}</b> — {o.medicaments}
                          <span style={{ ...styles.ordonnanceStatut, color: o.statut === "En cours" ? "#38b6ff" : "#888" }}>{o.statut}</span>
                          <span style={styles.ordonnanceStructure}><FaHospital /> {o.structure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Suivi santé */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}><FaChartLine /> Suivi santé</div>
                    <div style={styles.graph}>
                      (Graphique d'évolution à intégrer)
                    </div>
                  </div>
                  {/* Messagerie */}
                  <div style={styles.section}>
                    <div style={styles.sectionTitle}><FaComments /> Messagerie</div>
                    <div style={styles.messagerie}>
                      (Zone de messagerie IA/médecin à intégrer)
                    </div>
                  </div>
                </div>

                {/* Actions principales */}
                <div style={styles.actions}>
                  <button
                    style={styles.actionBtn}
                    onClick={() => navigate("/chatAI")}
                  >
                    <FaStethoscope /> Lancer un diagnostic
                  </button>
                  <button style={styles.actionBtn}><FaCalendarAlt /> Prendre rendez-vous</button>
                </div>

                {/* Upload fichiers médicaux */}
                <div style={styles.upload}>
                  <FaUpload />
                  <label htmlFor="file-upload" style={{ cursor: "pointer", color: colors.bleu, fontWeight: 600 }}>
                    Téléverser un fichier médical
                  </label>
                  <input id="file-upload" type="file" style={{ display: "none" }} />
                </div>

                {/* Notifications */}
                <div>
                  {notifications.map(n => (
                    <div key={n.id} style={styles.notif}>
                      <FaBell /> {n.texte}
                    </div>
                  ))}
                </div>

                {/* Proposition de contact médecin */}
                <div style={{
                  background: "#e0eafc",
                  borderRadius: "12px",
                  padding: "1.2rem 2rem",
                  margin: "1.5rem 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  boxShadow: "0 2px 8px rgba(46,125,255,0.07)"
                }}>
                  <div style={{ fontWeight: 700, color: "#2563eb", fontSize: "1.1rem" }}>
                    Souhaitez-vous parler à un médecin ?
                  </div>
                  <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
                    <button
                      style={{ ...styles.actionBtn, background: "#38b6ff" }}
                      onClick={() => navigate("/chatAI")}
                    >
                      Discuter avec un médecin
                    </button>
                    <button
                      style={{ ...styles.actionBtn, background: "#2563eb" }}
                      onClick={() => navigate("/tv_consuting")}
                    >
                      Prendre une téléconsultation
                    </button>
                    <button
                      style={{ ...styles.actionBtn, background: "#059669" }}
                      onClick={() => navigate("/structures")}
                    >
                      Choisir une structure médicale
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
