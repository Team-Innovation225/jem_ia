import React, { useState, useRef, useEffect } from "react";
import { FaUserMd, FaUserCircle, FaStethoscope, FaClock, FaPaperPlane, FaFileMedical, FaCommentDots, FaCheck } from "react-icons/fa";

export default function Teleconsultation() {
  // Données fictives
  const [structure] = useState({ id: 1, nom: "" });
  const [medecin] = useState({ nom: "" });
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
  const [chrono, setChrono] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showChat, setShowChat] = useState(false);
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
      justifyContent: "space-between"
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      minHeight: 0,
      padding: "2rem 0",
    },
    videoZone: {
      width: "80vw",
      maxWidth: 1100,
      height: "60vh",
      minHeight: 420,
      background: colors.blanc,
      borderRadius: 24,
      boxShadow: "0 2px 24px rgba(46,125,255,0.10)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      marginBottom: "2rem",
    },
    patientVideo: {
      width: "100%",
      height: "100%",
      background: colors.grisFonce,
      borderRadius: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "6rem",
      color: colors.bleu,
      position: "relative",
    },
    medecinVideo: {
      position: "absolute",
      bottom: 32,
      right: 32,
      width: 120,
      height: 120,
      background: colors.gris,
      border: `3px solid ${colors.bleu}`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2.8rem",
      color: colors.bleu,
      boxShadow: "0 2px 8px rgba(46,125,255,0.12)",
      zIndex: 2,
    },
    chrono: {
      position: "absolute",
      top: 24,
      right: 32,
      background: colors.vert,
      color: "#fff",
      borderRadius: 10,
      padding: "0.5rem 1.3rem",
      fontWeight: 700,
      fontSize: "1.15rem",
      display: "flex",
      alignItems: "center",
      gap: 8,
      zIndex: 2,
    },
    actionsBar: {
      display: "flex",
      gap: "2rem",
      justifyContent: "center",
      marginTop: "1.5rem",
    },
    actionBtn: {
      background: colors.blanc,
      color: colors.bleu,
      border: `2px solid ${colors.bleu}`,
      borderRadius: "1.2rem",
      padding: "1rem 2.2rem",
      fontWeight: 600,
      fontSize: "1.15rem",
      cursor: "pointer",
      boxShadow: "0 2px 12px rgba(46,125,255,0.07)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      transition: "background 0.2s, color 0.2s",
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
      borderRadius: 18,
      padding: "2rem",
      minWidth: 340,
      maxWidth: 400,
      boxShadow: "0 2px 24px rgba(46,125,255,0.13)",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      alignItems: "center",
      maxHeight: "80vh",
      overflowY: "auto",
    },
    chatArea: {
      width: "100%",
      maxHeight: 220,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "0.7rem",
      marginBottom: 8,
      minHeight: 80,
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
      width: "100%",
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
    infoBloc: {
      background: colors.gris,
      borderRadius: 10,
      padding: "0.8rem 1rem",
      fontSize: "1.02rem",
      color: "#222",
      marginBottom: 6,
      width: "100%",
    },
    closeBtn: {
      marginTop: 16,
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "0.7rem 1.2rem",
      fontWeight: 600,
      fontSize: "1.05rem",
      cursor: "pointer",
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
        <span>
          <FaStethoscope /> Téléconsultation — <span style={{ color: "#222" }}>{medecin.nom}</span>, <span style={{ color: colors.vert }}>{structure.nom}</span>
        </span>
      </div>
      <div style={styles.main}>
        {/* Zone vidéo en grand */}
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
        {/* Barre d'actions en bas */}
        <div style={styles.actionsBar}>
          <button style={styles.actionBtn} onClick={() => setShowChat(true)}>
            <FaCommentDots /> Chat
          </button>
          <button style={styles.actionBtn} onClick={() => setShowFiles(true)}>
            <FaFileMedical /> Dossier patient
          </button>
          <button style={styles.actionBtn} onClick={() => setShowEnd(true)}>
            <FaCheck /> Terminer
          </button>
        </div>
      </div>
      {/* Modals dépliants */}
      {showChat && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: colors.bleu, marginBottom: 8 }}>
              <FaCommentDots /> Chat avec le médecin
            </div>
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
            <button style={styles.closeBtn} onClick={() => setShowChat(false)}>Fermer</button>
          </div>
        </div>
      )}
      {showFiles && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: colors.bleu, marginBottom: 12 }}>
              <FaFileMedical /> Mon dossier patient
            </div>
            <div style={styles.infoBloc}><b>Nom :</b> {patient.nom}</div>
            <div style={styles.infoBloc}><b>Âge :</b> {patient.age} ans</div>
            <div style={styles.infoBloc}><b>Sexe :</b> {patient.sexe}</div>
            <div style={styles.infoBloc}><b>Groupe sanguin :</b> {patient.groupeSanguin}</div>
            <div style={styles.infoBloc}><b>Symptômes :</b> {patient.symptomes}</div>
            <div style={styles.infoBloc}><b>Antécédents :</b> {patient.antecedents}</div>
            <div style={styles.infoBloc}><b>Diagnostic IA :</b> {patient.diagnosticIA} <span style={{ color: "#e53e3e", fontWeight: 600 }}>({patient.gravite})</span></div>
            <button style={styles.closeBtn} onClick={() => setShowFiles(false)}>Fermer</button>
          </div>
        </div>
      )}
      {showEnd && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={{ fontWeight: 700, fontSize: "1.15rem", color: colors.bleu, marginBottom: 8 }}>
              Terminer la consultation
            </div>
            <div style={{ color: "#444", marginBottom: 16, textAlign: "center" }}>
              Voulez-vous vraiment terminer la téléconsultation ?
            </div>
            <button style={{ ...styles.closeBtn, background: colors.danger }} onClick={() => setShowEnd(false)}>
              Annuler
            </button>
            <button style={styles.closeBtn} onClick={() => {/* Ajoute ici la logique de fin d'appel */}}>
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}