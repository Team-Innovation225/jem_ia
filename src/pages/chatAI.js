import { useState, useEffect, useRef } from "react";
import { converseWithIA, getProfilUtilisateur } from "../services/api";
import { deconnexion } from "../services/firebase";
import { FaMicrophone, FaPlus } from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import LoginPage from "./login";
import RegisterPage from "./inscription";

export default function ChatAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarView, setSidebarView] = useState("welcome"); // "welcome" | "login" | "register"
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Récupération du profil utilisateur si déjà connecté
  useEffect(() => {
    const fetchProfil = async () => {
      const idToken = localStorage.getItem("idToken");
      if (idToken) {
        const profil = await getProfilUtilisateur(idToken);
        setUser(profil);
      }
    };
    fetchProfil();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Déconnexion
  const handleLogout = async () => {
    await deconnexion();
    setUser(null);
    setSidebarView("login");
    localStorage.removeItem("idToken");
  };

  // Chat
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setShowWelcome(false);
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    try {
      const data = await converseWithIA(input);
      setMessages((msgs) => [
        ...msgs,
        { from: "ia", text: data.response },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { from: "ia", text: err.message || "Erreur lors du diagnostic." },
      ]);
    }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(false);
  };

  // Styles dynamiques pour la sidebar
  const sidebarWidth = (sidebarView === "login" || sidebarView === "register") ? "640px" : "340px";
  const sidebarTransition = "width 0.4s cubic-bezier(.4,2,.6,1), background 0.3s";
  const sidebarBg = (sidebarView === "login" || sidebarView === "register")
    ? "#e0eafc"
    : "#f4f6f8";

  const isFormView = sidebarView === "login" || sidebarView === "register";

  const styles = {
    layout: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "linear-gradient(120deg, #e0eafc, #cfdef3)",
    },
    sidebar: {
      width: sidebarWidth,
      minWidth: sidebarWidth,
      maxWidth: sidebarWidth,
      overflowY: "auto",
      background: sidebarBg,
      borderRight: "1px solid #b3d8f7",
      padding: isFormView ? "3rem 2.5rem" : "2rem 1.5rem",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: isFormView ? "center" : "space-between", // centrer verticalement pour les formulaires
      alignItems: "center",
      minHeight: "100vh",
      transition: sidebarTransition,
    },
    sidebarTop: {
      width: "100%",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    sidebarBottom: {
      width: "100%",
      marginTop: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    menuTitle: {
      fontSize: "1.5rem",
      color: "#2d3a4b",
      fontWeight: 700,
      marginBottom: "1.5rem",
      letterSpacing: "1px",
      textAlign: "center",
    },
    menuBtn: {
      width: "100%",
      padding: "0.8rem",
      margin: "0.5rem 0",
      background: "linear-gradient(90deg, #4f8cff, #38b6ff)",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "1.1rem",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
      transition: "background 0.2s",
    },
    desc: {
      fontSize: "1.15rem",
      color: "#1a2a3a",
      margin: "1.5rem 0 2rem 0",
      textAlign: "center",
      lineHeight: 1.7,
      fontWeight: 400,
    },
    chatRoot: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "rgba(193, 218, 243, 0.25)",
      overflow: "hidden",
    },
    chatContainer: {
      width: "100%",
      height: "100%",
      borderRadius: "15px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      flex: 1,
    },
    chatArea: {
      width: "100%",
      maxWidth: "600px",
      flex: 1,
      minHeight: 0,
      margin: "3rem auto 0 auto",
      padding: "2rem 0 1.5rem 0",
      display: "flex",
      flexDirection: "column",
      gap: "1.2rem",
      overflowY: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      paddingBottom: "90px",
    },
    msgRow: {
      display: "flex",
      width: "100%",
      marginBottom: "0.5rem",
    },
    msgUser: {
      marginLeft: "auto",
      background: "linear-gradient(90deg, #b3d8f7, #c1daf3)",
      color: "#1a2a3a",
      borderRadius: "18px 18px 4px 18px",
      padding: "1.1rem 1.5rem",
      maxWidth: "80%",
      fontSize: "1.13rem",
      boxShadow: "0 2px 12px rgba(79,140,255,0.10)",
      alignSelf: "flex-end",
      wordBreak: "break-word",
      border: "1px solid #b3d8f7",
      fontWeight: 500,
    },
    msgIA: {
      width: "100%",
      background: "transparent",
      color: "#2d3a4b",
      borderRadius: 0,
      padding: "0.5rem 0",
      fontSize: "1.05rem",
      boxShadow: "none",
      alignSelf: "stretch",
      wordBreak: "break-word",
      border: "none",
      fontWeight: 700,
      fontFamily: "inherit",
    },
    inputBarWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      background: "transparent",
      zIndex: 10,
      paddingBottom: "1.5rem",
      transition: sidebarTransition,
    },
    inputBar: {
      background: "#fff",
      borderRadius: "20px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
      width: "100%",
      maxWidth: "600px",
      display: "flex",
      alignItems: "flex-end",
      padding: "0.6rem 1rem",
      gap: "0.5rem",
      border: "1px solid #e0e0e0",
    },
    inputChat: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "1rem",
      background: "transparent",
      resize: "none",
      minHeight: "24px",
      maxHeight: "150px",
      overflowY: "auto",
    },
    iconBtn: {
      background: "none",
      border: "none",
      fontSize: "1.35rem",
      cursor: "pointer",
      margin: "0 0.3rem",
      color: "#4f8cff",
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
      transition: "background 0.2s",
      opacity: 1,
      marginLeft: "0.2rem",
      background: "rgba(1, 45, 128, 0.85)",
    },
    welcome: {
      margin: "auto",
      textAlign: "center",
      fontSize: "2.1rem",
      fontWeight: 700,
      color: "#2d3a4b",
      letterSpacing: "1px",
      opacity: 0.9,
      lineHeight: 1.5,
      background: "rgba(255,255,255,0.8)",
      borderRadius: "18px",
      padding: "2.5rem 2rem",
      boxShadow: "0 2px 24px rgba(79,140,255,0.10)",
      maxWidth: "600px",
    },
  };

  // --- Sidebar content ---
  function SidebarContent() {
    if (user) {
      return (
        <div style={styles.sidebarTop}>
          <div style={styles.menuTitle}>
            Bonjour, <span style={{ color: "#4f8cff" }}>{user.prenom || user.nom || "Utilisateur"}</span>
          </div>
        </div>
      );
    }
    if (sidebarView === "login") {
      return (
        <LoginPage
          onSuccess={async (profil) => {
            setUser(profil);           // Active le chat
            setSidebarView("welcome"); // Rétracte la sidebar
          }}
        />
      );
    }
    if (sidebarView === "register") {
      return (
        <RegisterPage
          onSuccess={profil => {
            setUser(profil);           // Active le chat
            setSidebarView("welcome"); // Rétracte la sidebar
          }}
        />
      );
    }
    // Vue d'accueil sidebar
    return (
      <div style={styles.sidebarTop}>
        <div style={styles.menuTitle}>Bienvenue sur SanteAI</div>
        <div style={styles.desc}>
          Votre assistant IA pour le diagnostic et le conseil santé.<br />
          <b>Connectez-vous</b> ou <b>créez un compte</b> pour commencer à discuter avec notre intelligence artificielle médicale.
        </div>
        <button style={styles.menuBtn} onClick={() => setSidebarView("login")}>Se connecter</button>
        <button style={styles.menuBtn} onClick={() => setSidebarView("register")}>Créer un compte</button>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      {/* Colonne gauche : menu, login, inscription */}
      <div style={styles.sidebar}>
        <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          <SidebarContent />
        </div>
        {user && (
          <div style={styles.sidebarBottom}>
            <button style={{ ...styles.menuBtn, background: "#e53e3e" }} onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
      {/* Colonne droite : chat */}
      <div style={styles.chatRoot}>
        <div style={styles.chatContainer}>
          <div style={styles.chatArea}>
            {showWelcome && messages.length === 0 ? (
              <div style={styles.welcome}>
                <span role="img" aria-label="santé">🩺</span> Bienvenue sur <span style={{ color: "#4f8cff" }}>SanteAI</span> !<br />
                <div style={styles.desc}>
                  SanteAI est une intelligence artificielle dédiée à votre santé.<br />
                  Posez vos questions, décrivez vos symptômes ou demandez des conseils médicaux.<br />
                  <b>Attention :</b> Les réponses fournies ne remplacent pas un avis médical professionnel.
                </div>
                {!user && (
                  <div style={{ marginTop: "2rem", fontSize: "1.1rem" }}>
                    <b>Veuillez vous connecter ou créer un compte pour commencer.</b>
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.msgRow,
                      justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={msg.from === "user" ? styles.msgUser : styles.msgIA}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          {/* Barre de saisie */}
          {user && (
            <div style={styles.inputBarWrapper}>
              <form
                onSubmit={handleSubmit}
                style={{
                  ...styles.inputBar,
                  opacity: loading ? 0.7 : 1,
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                <button type="button" style={styles.iconBtn} tabIndex={-1} aria-label="Ajouter">
                  <FaPlus size={18} color="#4f8cff" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Message SanteAI..."
                  rows={1}
                  style={{
                    ...styles.inputChat,
                    width: input.length > 0 ? undefined : "80px",
                  }}
                />
                <button type="button" style={styles.iconBtn} tabIndex={-1} aria-label="Micro">
                  <FaMicrophone size={20} color="#4f8cff" />
                </button>
                {input.trim() && (
                  <button type="submit" style={styles.button} aria-label="Envoyer">
                    <FiArrowUp size={20} color="white" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
