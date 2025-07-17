import { useState, useEffect, useRef } from "react";
import FilesModal from "./files";
import { useNavigate } from "react-router-dom";
import {
  FaPaperclip,
  FaVideo,
  FaFileMedical,
  FaMicrophone,
  FaUserMd,
  FaNotesMedical,
} from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import AudioChatAI from "./AudioChatAI"; // Assurez-vous que le chemin est correct

export default function ChatAI() {
  const navigate = useNavigate();

  // Données contextuelles (structure, patient, etc.) inchangées
  // const [structure] = useState({ id: 1, nom: "CHR Bouaké" });
  const [showFiles, setShowFiles] = useState(false);
  // const [interlocuteur] = useState({ nom: "Dr. Koné", type: "medecin" });
  // const [patient] = useState({
  //   nom: "Marie Kouassi",
  //   age: 32,
  //   sexe: "Femme",
  //   groupeSanguin: "A+",
  // });
  // const [dernierDiag] = useState({
  //   symptomes: "Fièvre, toux",
  //   diagnostic: "Grippe saisonnière",
  //   date: "10/07/2025",
  //   gravite: "Modérée",
  // });
  // const [consultations] = useState([
  //   { id: 1, date: "01/07/2025", motif: "Toux", diagnostic: "Rhume" },
  //   { id: 2, date: "15/06/2025", motif: "Maux de tête", diagnostic: "Migraine" },
  // ]);

  // --- Partie logique IA/session/feedback adaptée ---
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAudioPage, setShowAudioPage] = useState(false);
  const chatMessagesRef = useRef(null);
  const textareaRef = useRef(null);

  // URL de votre backend Django
  const DJANGO_CHAT_URL = 'https://564fca1c6c02.ngrok-free.app/ia/chat/';
  const DJANGO_FEEDBACK_URL = 'https://564fca1c6c02.ngrok-free.app/ia/feedback/';

  // Scroll fluide
  useEffect(() => {
    chatMessagesRef.current?.scrollTo({ top: chatMessagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Message initial IA
  useEffect(() => {
    setMessages([{
      id: 'initial-ia-message',
      sender: 'ia',
      text: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
      aiMessageDbId: null,
      feedback: null
    }]);
  }, []);

  // Envoi message utilisateur
  const sendMessage = async () => {
    const message = userInput.trim();
    if (message === '') return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: message }
    ]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch(DJANGO_CHAT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_utilisateur: message, // <-- ici !
          id_session: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la communication avec l\'IA.');
      }

      const data = await response.json();

      if (!sessionId && data.id_session) {
        setSessionId(data.id_session);
        console.log('Nouvelle session ID:', data.id_session);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ia-${data.ai_message_db_id || Date.now()}`,
          sender: 'ia',
          text: data.reponse_ia,
          aiMessageDbId: data.ai_message_db_id,
          feedback: null
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ia',
          text: `Désolé, une erreur est survenue: ${error.message}. Veuillez réessayer.`,
          aiMessageDbId: null,
          feedback: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Feedback IA
  const handleFeedback = async (messageId, feedbackValue) => {
    const messageToUpdate = messages.find(msg => msg.id === messageId);
    if (!messageToUpdate || messageToUpdate.aiMessageDbId === null) {
      console.warn('Impossible d\'envoyer le feedback: message non trouvé ou pas d\'ID de message DB.');
      return;
    }

    try {
      const response = await fetch(DJANGO_FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageToUpdate.aiMessageDbId,
          feedback_value: feedbackValue,
          id_session: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du feedback.');
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, feedback: feedbackValue } : msg
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      alert(`Erreur lors de l'envoi du feedback: ${error.message}`);
    }
  };

  // Styles médicaux (inchangés)
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
      minHeight: "100vh",
      background: colors.gris,
      display: "flex",
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "flex-start",
      fontFamily: "Segoe UI, Arial, sans-serif",
      height: "100vh",
      boxSizing: "border-box",
    },
    sidebar: {
      width: 320,
      minWidth: 260,
      maxWidth: 340,
      background: "#fff",
      borderRadius: "1.5rem 0 0 1.5rem",
      boxShadow: "2px 0 16px 0 rgba(46,125,255,0.10)",
      padding: "2rem 1.2rem 1.2rem 1.2rem",
      display: "flex",
      flexDirection: "column",
      gap: "2rem",
      height: "100vh",
      position: "sticky",
      left: 0,
      top: 0,
      borderRight: "2px solid #e0eafc",
      zIndex: 10,
    },
    sidebarScroll: {
      flex: 1,
      overflowY: "auto",
      paddingRight: 8,
      marginBottom: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    sidebarSection: {
      background: "#f8fafc",
      borderRadius: "1rem",
      boxShadow: "0 1px 6px rgba(46,125,255,0.06)",
      padding: "1.1rem 1rem",
      marginBottom: "0.5rem",
      border: "1px solid #e0eafc",
    },
    sectionTitle: {
      fontWeight: 700,
      color: colors.bleu,
      fontSize: "1.1rem",
      marginBottom: "0.7rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    infoBloc: {
      fontSize: "1.05rem",
      color: colors.texte,
      marginBottom: 0,
      background: "none",
      border: "none",
      padding: 0,
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
      color: "#333",
    },
    upload: {
      marginTop: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.7rem",
      cursor: "pointer",
      color: colors.bleu,
      fontWeight: 600,
      background: "#f0f9ff",
      borderRadius: "0.7rem",
      padding: "0.6rem 1rem",
      border: "1px solid #bae6fd",
      boxShadow: "0 1px 4px rgba(46,125,255,0.04)",
    },
    sidebarActions: {
      display: "flex",
      flexDirection: "row",
      gap: "1.1rem",
      justifyContent: "center",
      marginTop: "1.2rem",
      paddingTop: "1.2rem",
      borderTop: "1px solid #e0eafc",
    },
    sidebarBtn: {
      background: colors.bleu,
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: 54,
      height: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      boxShadow: "0 2px 12px rgba(46,125,255,0.13)",
      cursor: "pointer",
      transition: "background 0.2s",
    },
    chatWrapper: {
      flex: 1,
      background: colors.blanc,
      borderRadius: "0 1.5rem 1.5rem 0",
      boxShadow: "0 2px 16px rgba(46,125,255,0.07)",
      margin: "0 2.5rem 0 0",
      display: "flex",
      flexDirection: "column",
      minHeight: 600,
      height: "100vh",
      position: "relative",
      maxWidth: "100%",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1.2rem 2rem",
      borderBottom: `1px solid ${colors.grisFonce}`,
      background: colors.gris,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      position: "sticky",
      top: 0,
      zIndex: 2,
    },
    avatar: {
      background: colors.bleu,
      color: "#fff",
      borderRadius: "50%",
      width: 44,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.6rem",
    },
    interlocuteur: {
      fontWeight: 700,
      fontSize: "1.15rem",
      color: colors.bleu,
    },
    structure: {
      color: colors.vert,
      fontWeight: 600,
      fontSize: "1.05rem",
      marginLeft: 8,
    },
    chatArea: {
      flex: 1,
      overflowY: "auto",
      padding: "2rem 1.5rem 1rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      background: colors.gris,
      position: "relative",
    },
    msgRow: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      width: "100%",
    },
    msgBubbleUser: {
      background: colors.bleu,
      color: "#fff",
      borderRadius: "14px 14px 4px 14px",
      padding: "1rem 1.3rem",
      maxWidth: "70%",
      alignSelf: "flex-end",
      fontSize: "1.08rem",
      fontWeight: 500,
      boxShadow: "0 2px 8px rgba(46,125,255,0.08)",
      wordBreak: "break-word",
    },
    msgBubbleOther: {
      background: colors.blanc,
      color: colors.texte,
      borderRadius: "14px 14px 14px 4px",
      padding: "1rem 1.3rem",
      maxWidth: "70%",
      alignSelf: "flex-start",
      fontSize: "1.08rem",
      fontWeight: 500,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      wordBreak: "break-word",
    },
    timestamp: {
      fontSize: "0.85rem",
      color: "#aaa",
      marginTop: "0.2rem",
      alignSelf: "flex-end",
    },
    timestampOther: {
      alignSelf: "flex-start",
    },
    typing: {
      fontStyle: "italic",
      color: colors.vert,
      fontSize: "1rem",
      marginLeft: 8,
      marginBottom: 8,
    },
    inputBarWrapper: {
      padding: "1.2rem 1.5rem",
      borderTop: `1px solid ${colors.grisFonce}`,
      background: colors.gris,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      position: "sticky",
      bottom: 0,
      zIndex: 2,
    },
    inputBar: {
      background: colors.blanc,
      borderRadius: 12,
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "flex-end",
      padding: "0.5rem 1rem",
      gap: "0.5rem",
      border: `1px solid ${colors.grisFonce}`,
    },
    inputChat: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "1.08rem",
      background: "transparent",
      resize: "none",
      minHeight: "28px",
      maxHeight: "120px",
      overflowY: "auto",
    },
    iconBtn: {
      background: "none",
      border: "none",
      fontSize: "1.35rem",
      cursor: "pointer",
      color: colors.bleu,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "40px",
      flexShrink: 0,
    },
    button: {
      padding: "10px 15px",
      border: "none",
      borderRadius: "10px",
      fontWeight: 600,
      fontSize: "1.1rem",
      cursor: "pointer",
      background: colors.bleu,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.root}>
      {/* Flèche retour */}
      {showFiles && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "70px",
            width: 420,
            height: 420,
            background: "#fff",
            borderRadius: "1.2rem",
            boxShadow: "0 4px 32px #38b6ff33",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <FilesModal onClose={() => setShowFiles(false)} />
        </div>
      )}
      {/* Chat principal à droite */}
      <div style={styles.chatWrapper}>
        {/* En-tête contextualisée + actions */}
        <div style={{
          ...styles.header,
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={styles.avatar}>
              <FaNotesMedical />
            </div>
            <div>
              <span style={{
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "1.15rem",
                color: colors.bleu,
              }}>
                SanteAI
              </span>
            </div>
          </div>
          {/* Actions en haut à droite */}
          <div style={{ display: "flex", gap: "1.1rem" }}>
            <button
              style={styles.sidebarBtn}
              title="Dossiers patient"
              onClick={() => setShowFiles(true)}
            >
              <FaFileMedical size={24} />
            </button>
            <button
              style={styles.sidebarBtn}
              title="Téléconsultation"
              onClick={() => navigate("/tv_consuting")}
            >
              <FaVideo size={24} />
            </button>
            <button
              style={styles.sidebarBtn}
              title="Chat avec le médecin"
              onClick={() => navigate("/chat_medecin")}
            >
              <FaUserMd size={26} />
            </button>
          </div>
        </div>
        {/* Fil de discussion */}
        <div
          style={styles.chatArea}
          ref={chatMessagesRef}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.msgRow,
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={msg.sender === "user" ? styles.msgBubbleUser : styles.msgBubbleOther}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
              {/* Feedback IA */}
              {msg.sender === "ia" && msg.aiMessageDbId !== null && (
                <div style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 4,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  fontSize: "0.92rem",
                  minHeight: 28,
                }}>
                  <button
                    onClick={() => handleFeedback(msg.id, 1)}
                    style={{
                      padding: 3,
                      borderRadius: "50%",
                      fontSize: 15,
                      background: msg.feedback === 1 ? "#22c55e" : "#e0eafc",
                      color: msg.feedback === 1 ? "#fff" : "#2563eb",
                      border: "none",
                      cursor: msg.feedback !== null ? "not-allowed" : "pointer",
                      opacity: msg.feedback !== null ? 0.6 : 1,
                      transition: "background 0.2s",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Utile"
                    disabled={loading || msg.feedback !== null}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 0)}
                    style={{
                      padding: 3,
                      borderRadius: "50%",
                      fontSize: 15,
                      background: msg.feedback === 0 ? "#ef4444" : "#e0eafc",
                      color: msg.feedback === 0 ? "#fff" : "#2563eb",
                      border: "none",
                      cursor: msg.feedback !== null ? "not-allowed" : "pointer",
                      opacity: msg.feedback !== null ? 0.6 : 1,
                      transition: "background 0.2s",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Pas utile"
                    disabled={loading || msg.feedback !== null}
                  >
                    👎
                  </button>
                  {msg.feedback !== null && (
                    <span style={{
                      fontSize: "0.85rem",
                      color: "#22c55e",
                      marginLeft: 6,
                      fontWeight: 500,
                    }}>
                      Merci pour votre retour
                    </span>
                  )}
                </div>
              )}
              <div
                style={{
                  ...styles.timestamp,
                  ...(msg.sender === "user" ? {} : styles.timestampOther),
                }}
              >
                {/* Affiche l'heure si tu veux, sinon laisse vide */}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msgRow, alignItems: "flex-start" }}>
              <div style={styles.typing}>L'IA réfléchit...</div>
            </div>
          )}
        </div>
        {/* Barre de saisie */}
        <div style={styles.inputBarWrapper}>
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            style={{
              ...styles.inputBar,
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            <button
              type="button"
              style={styles.iconBtn}
              tabIndex={-1}
              aria-label="Enregistrer un audio"
              onClick={() => alert("Fonction d'enregistrement audio à venir")}
            >
              <FaMicrophone size={18} />
            </button>
            <button type="button" style={styles.iconBtn} tabIndex={-1} aria-label="Pièce jointe">
              <FaPaperclip size={18} />
            </button>
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={e => {
                setUserInput(e.target.value);
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
                }
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Votre message..."
              rows={1}
              style={styles.inputChat}
              disabled={loading}
            />
            {/* Bouton rond avec onde sonore */}
            <button
              type="button"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "2px solid #fff", // Bordure blanche
                outline: "none",
                background: "transparent", // Fond vide
                boxShadow: "0 2px 12px #e0eafc44",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border 0.2s, box-shadow 0.2s",
                marginRight: 8,
                padding: 0,
              }}
              title="Démarrer une conversation audio avec l'IA"
              onClick={() => setShowAudioPage(true)}
            >
              <img
                src="/voice-message.png"
                alt="Appel vocal"
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
            </button>
            <button type="submit" style={styles.button} aria-label="Envoyer" disabled={loading}>
              <FiArrowUp size={20} color="white" />
            </button>
          </form>
        </div>
        {/* Affichage conditionnel de la page audio */}
        {showAudioPage && (
          <AudioChatAI onClose={() => setShowAudioPage(false)} />
        )}
      </div>
    </div>
  );
}

/*
@keyframes wave {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  70% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 4px #e0eafc; }
  70% { box-shadow: 0 0 0 12px #e0eafc44; }
  100% { box-shadow: 0 0 0 4px #e0eafc; }
}
*/
