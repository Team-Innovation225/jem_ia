import React, { useState, useRef, useEffect } from "react";
import { FaUserMd, FaUserCircle, FaStethoscope, FaNotesMedical, FaClock, FaPaperPlane, FaFilePrescription, FaCheck } from "react-icons/fa";

export default function Teleconsultation() {
  // Données fictives
  const [structure] = useState({ id: 1, nom: "CHU Yamoussoukro" });
  const [medecin] = useState({ nom: "Dr. Zongo" });
  const [patient] = useState({
    nom: "Marie Kouassi",
    age: 32,
    sexe: "Femme",
    groupeSanguin: "A+",
    symptomes: "Fièvre, toux",
    antecedents: "Asthme",
    diagnosticIA: "Grippe saisonnière",
    gravite: "Modérée"
  });
  const [chat, setChat] = useState([
    { from: "medecin", text: "Bonjour, pouvez-vous me décrire vos symptômes ?", time: "09:00" }
  ]);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [chrono, setChrono] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const chronoRef = useRef();

  // Chronomètre
  useEffect(() => {
    chronoRef.current = setInterval(() => setChrono(c => c + 1), 1000);
    return () => clearInterval(chronoRef.current);
  }, []);

  function formatChrono(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // Chat
  const handleSend = e => {
    e.preventDefault();
    if (!input.trim()) return;
    setChat([...chat, { from: "patient", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  // Styles
  const colors = {
    bleu: "#2e7dff",
    vert: "#38b6ff",
    blanc: "#fff",
    gris: "#f7f7f8",
    grisFonce: "#e0eafc",
    danger: "#e53e3e",
  };

  const styles = {
    root: {
      minHeight: "100vh",
      background: colors.gris,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Segoe UI, Arial, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "1.2rem",
      background: colors.blanc,
      borderBottom: `1px solid ${colors.grisFonce}`,
      padding: "1.2rem 2rem",
      fontWeight: 700,
      fontSize: "1.15rem",
      color: colors.bleu,
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    main: {
      display: "flex",
      flex: 1,
      gap: "2rem",
      padding: "2rem",
      minHeight: 0,
    },
    videoZone: {
      flex: 2,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      background: colors.blanc,
      borderRadius: 18,
      boxShadow: "0 2px 16px rgba(46,125,255,0.07)",
      overflow: "hidden",
      minHeight: 420,
      justifyContent: "center",
      alignItems: "center",
    },
    patientVideo: {
      width: "100%",
      height: 340,
      background: colors.grisFonce,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "4rem",
      color: colors.bleu,
      position: "relative",
    },
    medecinVideo: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 110,
      height: 110,
      background: colors.gris,
      border: `3px solid ${colors.bleu}`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2.5rem",
      color: colors.bleu,
      boxShadow: "0 2px 8px rgba(46,125,255,0.12)",
      zIndex: 2,
    },
    chrono: {
      position: "absolute",
      top: 18,
      right: 24,
      background: colors.vert,
      color: "#fff",
      borderRadius: 8,
      padding: "0.4rem 1.1rem",
      fontWeight: 700,
      fontSize: "1.1rem",
      display: "flex",
      alignItems: "center",
      gap: 8,
      zIndex: 2,
    },
    chatBloc: {
      background: colors.blanc,
      borderRadius: 18,
      boxShadow: "0 2px 16px rgba(46,125,255,0.07)",
      padding: "1.2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      minWidth: 260,
      maxWidth: 340,
      flex: 1,
      minHeight: 0,
      height: "100%",
    },
    chatArea: {
      flex: 1,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "0.7rem",
      marginBottom: 8,
      minHeight: 80,
      maxHeight: 220,
    },
    chatMsg: from => ({
      alignSelf: from === "medecin" ? "flex-start" : "flex-end",
      background: from === "medecin" ? colors.grisFonce : colors.bleu,
      color: from === "medecin" ? "#222" : "#fff",
      borderRadius: "14px",
      padding: "0.7rem 1.1rem",
      fontSize: "1.02rem",
      maxWidth: "80%",
      fontWeight: 500,
      boxShadow: "0 1px 4px rgba(46,125,255,0.06)",
      marginBottom: 2,
    }),
    chatTime: {
      fontSize: "0.85rem",
      color: "#aaa",
      marginTop: 2,
      marginBottom: 2,
      alignSelf: "flex-end",
    },
    chatForm: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
      marginTop: 4,
    },
    chatInput: {
      flex: 1,
      borderRadius: 8,
      border: `1px solid ${colors.grisFonce}`,
      padding: "0.6rem 1rem",
      fontSize: "1rem",
      outline: "none",
      background: colors.gris,
    },
    chatBtn: {
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "0.6rem 1rem",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    sidebar: {
      width: 320,
      minWidth: 220,
      background: colors.blanc,
      borderRadius: 18,
      boxShadow: "0 2px 16px rgba(46,125,255,0.07)",
      padding: "2rem 1.2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      height: "100%",
      minHeight: 0,
    },
    sectionTitle: {
      fontWeight: 700,
      color: colors.bleu,
      fontSize: "1.1rem",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    infoBloc: {
      background: colors.gris,
      borderRadius: 10,
      padding: "0.8rem 1rem",
      fontSize: "1.02rem",
      color: "#222",
      marginBottom: 6,
    },
    notes: {
      width: "100%",
      minHeight: 60,
      borderRadius: 8,
      border: `1px solid ${colors.grisFonce}`,
      padding: 10,
      fontSize: "1rem",
      marginBottom: 8,
      background: colors.gris,
    },
    endBtn: {
      background: colors.danger,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "0.8rem 1.2rem",
      fontWeight: 700,
      fontSize: "1.08rem",
      marginTop: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
    },
    modal: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    },
    modalContent: {
      background: colors.blanc,
      borderRadius: 14,
      padding: "2rem",
      minWidth: 320,
      maxWidth: 400,
      boxShadow: "0 2px 16px rgba(46,125,255,0.13)",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      alignItems: "center",
    },
    modalBtn: {
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "0.7rem 1.2rem",
      fontWeight: 600,
      fontSize: "1.05rem",
      cursor: "pointer",
      marginTop: 8,
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.root}>
      {/* En-tête */}
      <div style={styles.header}>
        <FaStethoscope />
        Téléconsultation — <span style={{ color: "#222" }}>{medecin.nom}</span>, <span style={{ color: colors.vert }}>{structure.nom}</span>
      </div>
      <div style={styles.main}>
        {/* Zone vidéo */}
        <div style={styles.videoZone}>
          <div style={styles.patientVideo}>
            <FaUserCircle />
            {/* Chronomètre */}
            <div style={styles.chrono}>
              <FaClock /> {formatChrono(chrono)}
            </div>
            {/* Vidéo médecin flottante */}
            <div style={styles.medecinVideo}>
              <FaUserMd />
            </div>
          </div>
        </div>
        {/* Chat + Bloc notes */}
        <div style={styles.chatBloc}>
          <div style={styles.sectionTitle}><FaNotesMedical /> Chat texte</div>
          <div style={styles.chatArea}>
            {chat.map((msg, idx) => (
              <div key={idx} style={styles.chatMsg(msg.from)}>
                {msg.text}
                <div style={styles.chatTime}>{msg.time}</div>
              </div>
            ))}
          </div>
          <form style={styles.chatForm} onSubmit={handleSend}>
            <input
              style={styles.chatInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Votre message…"
            />
            <button type="submit" style={styles.chatBtn}><FaPaperPlane /> Envoyer</button>
          </form>
          <div>
            <div style={styles.sectionTitle}><FaNotesMedical /> Notes du médecin</div>
            <textarea
              style={styles.notes}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ajouter une note sur la consultation…"
            />
          </div>
          <button style={styles.endBtn} onClick={() => setShowEnd(true)}>
            <FaCheck /> Terminer la consultation
          </button>
        </div>
        {/* Sidebar dossier patient */}
        <div style={styles.sidebar}>
          <div style={styles.sectionTitle}><FaUserCircle /> Dossier patient</div>
          <div style={styles.infoBloc}><b>{patient.nom}</b> — {patient.age} ans, {patient.sexe}</div>
          <div style={styles.infoBloc}>Groupe sanguin : {patient.groupeSanguin}</div>
          <div style={styles.infoBloc}><b>Symptômes :</b> {patient.symptomes}</div>
          <div style={styles.infoBloc}><b>Antécédents :</b> {patient.antecedents}</div>
          <div style={styles.infoBloc}><b>Diagnostic IA :</b> {patient.diagnosticIA} <span style={{ color: "#e53e3e", fontWeight: 600 }}>({patient.gravite})</span></div>
        </div>
      </div>
      {/* Modal de fin de consultation */}
      {showEnd && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: colors.bleu, marginBottom: 8 }}>
              Terminer la consultation
            </div>
            <button style={styles.modalBtn}><FaFilePrescription /> Ajouter une ordonnance</button>
            <button style={styles.modalBtn}><FaNotesMedical /> Envoyer un rapport</button>
            <button style={{ ...styles.modalBtn, background: colors.danger }} onClick={() => setShowEnd(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}