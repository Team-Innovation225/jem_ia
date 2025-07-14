import React, { useState, useRef, useEffect } from "react";
import { inscrirePatient, loginPatient } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// ----------- STYLES EN JS (injection dans <style>) -----------
const style = `
:root {
  --blue: #3b82f6;
  --green: #10b981;
  --slate: #0f172a;
  --slate-light: #64748b;
  --placeholder: #94a3b8;
  --error: #ef4444;
}
@media (prefers-color-scheme: dark) {
  body, .auth__wrapper {
    background: radial-gradient(circle at 50% 25%, #1e293b 0%, #0f172a 60%, #164e63 100%) !important;
  }
  .auth__title, .auth__subtitle, .auth__bullets, .auth__btn, .auth__brand, .auth__logo-retour, .auth__cgu {
    color: #e2e8f0 !important;
  }
  .auth__input {
    color: #e2e8f0;
    border-bottom: 2px solid #334155;
  }
  .auth__input::placeholder {
    color: #64748b;
  }
  .magic-divider {
    background: linear-gradient(180deg,#10b981 0%,#22d3ee 100%) !important;
    box-shadow: 0 0 32px 8px #22d3ee99 !important;
  }
}
.auth__wrapper {
  min-height: 100vh;
  width: 100vw;
  font-family: 'Inter', system-ui, sans-serif;
  background: radial-gradient(circle at 50% 25%, #fff 0%, #f6fafe 45%, #eef5ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
}
.auth__logo-retour {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 20;
}
.auth__brand {
  position: absolute;
  top: 24px;
  right: 24px;
  font-weight: bold;
  color: var(--green);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  user-select: none;
  z-index: 20;
}
.auth__section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6vh;
  padding-inline: 24px;
  margin-top: 80px;
  margin-bottom: 80px;
}
.auth__title {
  font-size: clamp(2.2rem, 4vw + 1rem, 3rem);
  font-weight: 800;
  letter-spacing: .02em;
  color: var(--slate);
  margin-bottom: 2.5vh;
  margin-top: 0;
  text-align: center;
}
.auth__subtitle {
  font-size: clamp(1.6rem, 2.5vw + .5rem, 2.2rem);
  font-weight: 700;
  color: var(--slate);
  margin-bottom: 2vh;
  margin-top: 0;
  text-align: center;
}
.auth__bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 2.5vh 0;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.auth__bullets li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--slate-light);
  line-height: 1.55;
}
.auth__bullets span {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
}
.auth__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.auth__input {
  background: none;
  border: none;
  border-bottom: 2px solid #cbd5e1;
  outline: none;
  padding: 10px 4px;
  font-size: 1.08rem;
  font-family: inherit;
  color: var(--slate);
  font-weight: 500;
  transition: border-color .22s cubic-bezier(.77,0,.18,1);
  line-height: 1.4;
  margin-bottom: 0;
  position: relative;
}
.auth__input::placeholder {
  color: var(--placeholder);
  font-style: italic;
  opacity: 1;
  transition: opacity .18s;
}
.auth__input.is-focus::placeholder {
  opacity: 0;
}
.auth__input.is-focus,
.auth__input:focus {
  border-bottom: 2px solid var(--blue);
}
.auth__input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
}
.auth__input-anim {
  position: absolute;
  left: 0; right: 0; bottom: -2px; height: 2px;
  background: var(--blue);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .28s cubic-bezier(.77,0,.18,1);
  pointer-events: none;
}
.auth__input.is-focus ~ .auth__input-anim {
  transform: scaleX(1);
}
.auth__btn {
  background: var(--blue);
  color: #fff;
  font-weight: 600;
  border-radius: 999px;
  width: 210px;
  padding: 14px 0;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all .18s cubic-bezier(.77,0,.18,1);
  box-shadow: 0 2px 8px #3b82f622;
  margin: 0 auto;
  display: block;
}
.auth__btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px #3b82f622;
}
.auth__btn:hover,
.auth__btn:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(59,130,246,.18);
  outline: none;
}
.auth__btn--link {
  background: none;
  color: var(--blue);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: none;
  width: auto;
  padding: 0;
  margin-top: 0.5em;
  transition: color .18s;
}
.auth__btn--link:hover,
.auth__btn--link:focus-visible {
  color: var(--green);
  background: none;
  box-shadow: none;
  outline: none;
}
.auth__cgu {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--slate-light);
  font-size: 1rem;
  margin-top: 8px;
  user-select: none;
}
.auth__error {
  color: var(--error);
  font-weight: 500;
  font-size: 0.97rem;
  margin-top: -10px;
  margin-bottom: 2px;
}
.magic-divider__container {
  display: none;
}
@media (min-width: 1024px) {
  .magic-divider__container {
    display: block;
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }
}
.magic-divider {
  position: absolute;
  border-radius: 8px;
  background: linear-gradient(180deg,#3b82f6 0%,#10b981 100%);
  box-shadow: 0 0 32px 6px #3b82f655;
  transition: all 0.7s cubic-bezier(.77,0,.18,1);
  z-index: 10;
}
@media (max-width: 480px) {
  .auth__section {
    padding-inline: 12px;
    gap: 4vh !important;
    margin-top: 40px;
    margin-bottom: 40px;
  }
  .auth__bullets {
    max-width: 98vw;
  }
}
`;

if (!document.getElementById("authpage-style")) {
  const styleTag = document.createElement("style");
  styleTag.id = "authpage-style";
  styleTag.innerHTML = style;
  document.head.appendChild(styleTag);
}

// ----------- ICONES SVG -----------
const IconSearch = (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6.5" stroke="#3b82f6" strokeWidth="2"/>
    <path d="M15.5 15.5L13 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconFolder = (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="5.5" width="15" height="10" rx="2" stroke="#10b981" strokeWidth="2"/>
    <path d="M2.5 7.5H17.5" stroke="#10b981" strokeWidth="2"/>
  </svg>
);
const IconVideo = (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="10" height="10" rx="2" stroke="#0ea5e9" strokeWidth="2"/>
    <path d="M15 8L18 6.5V13.5L15 12V8Z" fill="#0ea5e9"/>
  </svg>
);

// ----------- MAGIC DIVIDER -----------
function MagicDivider({ screen }) {
  const [pulse, setPulse] = useState(1);
  useEffect(() => {
    setPulse(1.1);
    const t = setTimeout(() => setPulse(1), 350);
    return () => clearTimeout(t);
  }, [screen]);
  return (
    <div className="magic-divider__container">
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
        className="magic-divider"
        style={{
          left:
            screen === "landing"
              ? "7%"
              : screen === "login"
              ? "calc(90% - 2rem)"
              : "50%",
          top: screen === "signup" ? 0 : "10%",
          transform:
            screen === "landing"
              ? "translateX(0)"
              : "translateX(-50%)",
          width: screen === "signup" ? "75vw" : "4px",
          height: screen === "signup" ? "4px" : "80vh",
        }}
        animate={{
          scaleX: pulse,
        }}
      />
    </div>
  );
}

const doctorURL = process.env.PUBLIC_URL + "/doctor_signup.svg";
const questionsImgURL = process.env.PUBLIC_URL + "/Questions-rafiki.svg";
const questionsVideoURL = process.env.PUBLIC_URL + "/Questions.mp4";

// Illustration inscription (signup)
function AssistantIllustration({ screen }) {
  const show = screen === "signup";
  return (
    <AnimatePresence>
      {show && (
        <motion.img
          key="assistant"
          src={doctorURL}
          alt="Assistant médical"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            position: "absolute",
            bottom: 0,
            right: "3%",
            left: "auto",
            width: "clamp(180px, 32vw, 300px)",
            height: "auto",
            pointerEvents: "none",
            zIndex: 6,
            display: "block"
          }}
          className="assistant-img"
        />
      )}
    </AnimatePresence>
  );
}

// Illustration connexion (login)
function LoginIllustration({ screen }) {
  const show = screen === "login";
  return (
    <AnimatePresence>
      {show && (
        <motion.img
          key="login-illu"
          src={questionsImgURL}
          alt="Connexion illustration"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          style={{
            position: "absolute",
            bottom: 0,
            right: "3%",
            left: "auto",
            width: "clamp(180px, 32vw, 300px)",
            height: "auto",
            pointerEvents: "none",
            zIndex: 6,
            display: "block"
          }}
          className="assistant-img"
        />
      )}
    </AnimatePresence>
  );
}

// Vidéo page d'accueil (landing) en bas à droite, petite taille, pas de boucle
function LandingVideo({ screen }) {
  const show = screen === "landing";
  return (
    <AnimatePresence>
      {show && (
        <motion.video
          key="landing-video"
          src={questionsVideoURL}
          autoPlay
          muted
          playsInline
          loop={false}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
          style={{
            position: "absolute",
            bottom: 0,
            right: "3%",
            left: "auto",
            width: "clamp(120px, 18vw, 220px)",
            height: "auto",
            pointerEvents: "none",
            zIndex: 6,
            display: "block",
            border: "none",
            outline: "none",
            boxShadow: "none",
            background: "none",
            borderRadius: 0,
            margin: 0
          }}
          className="landing-video"
          controls={false}
        />
      )}
    </AnimatePresence>
  );
}

// Ajout du style responsive pour masquer sur mobile
if (!document.getElementById("assistant-img-style")) {
  const styleTag = document.createElement("style");
  styleTag.id = "assistant-img-style";
  styleTag.innerHTML = `
    @media (max-width: 640px) {
      .assistant-img, .landing-video { display: none !important; }
    }
    .landing-video::-webkit-media-controls,
    .landing-video::-webkit-media-controls-panel,
    .landing-video::-webkit-media-controls-play-button,
    .landing-video::-webkit-media-controls-start-playback-button {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      -webkit-appearance: none !important;
    }
    .landing-video {
      background: none !important;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
  `;
  document.head.appendChild(styleTag);
}

const FORM_MAX = { width: "min(92%,420px)" };

export default function AuthPage() {
  const [screen, setScreen] = useState("landing");
  const [signup, setSignup] = useState({
    nom: "",
    prenom: "",
    date_naissance: "",
    genre: "",
    numero_telephone: "",
    email: "",
    mot_de_passe: "",
    confirmation_mot_de_passe: "",
    cgu: false,
  });
  const [login, setLogin] = useState({ courriel: "", mot_de_passe: "" }); // <-- correction ici
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Animation variants
  const variants = {
    landing: {
      initial: { opacity: 0, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 0 },
    },
    signup: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
    },
    login: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
    },
  };

  // Handlers
  const handleStart = () => setScreen("signup");
  const handleToLogin = () => setScreen("login");
  const handleToSignup = () => setScreen("signup");
  const handleBackLanding = () => setScreen("landing");

  // Signup submit
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, signup.email, signup.mot_de_passe);
      // Appel backend après création Firebase
      const res = await inscrirePatient({
        nom: signup.nom,
        prenom: signup.prenom,
        date_naissance: signup.date_naissance,
        genre: signup.genre,
        numero_telephone: signup.numero_telephone,
        email: signup.email,
        mot_de_passe: signup.mot_de_passe,
        confirmation: signup.confirmation_mot_de_passe
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      // Après inscription ou connexion réussie
      const patientData = res.data; // ou res selon ton API

      // Calcul de l'âge à partir de la date de naissance
      function calculerAge(dateNaissance) {
        const naissance = new Date(dateNaissance);
        const aujourdHui = new Date();
        let age = aujourdHui.getFullYear() - naissance.getFullYear();
        const m = aujourdHui.getMonth() - naissance.getMonth();
        if (m < 0 || (m === 0 && aujourdHui.getDate() < naissance.getDate())) {
          age--;
        }
        return age;
      }

      const patientProfil = {
        ...patientData,
        age: calculerAge(patientData.date_naissance),
      };

      // Redirection vers la page patient avec les données
      navigate("/patient", { state: { patient: patientProfil } });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.");
      } else {
        setError(error.message);
      }
      console.error(error.code, error.message);
    }
  };

  // Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.courriel || !login.mot_de_passe) { // <-- correction ici
      setError("Tous les champs sont requis.");
      return;
    }
    if (login.mot_de_passe.length < 6) {
      setError("Mot de passe trop court.");
      return;
    }
    setError("");

    // Appel API backend
    const res = await loginPatient(login.courriel, login.mot_de_passe); // <-- correction ici
    if (res.error) {
      setError(res.error);
      return;
    }
    // Après inscription ou connexion réussie
    const patientData = res.data; // ou res selon ton API

    // Calcul de l'âge à partir de la date de naissance
    function calculerAge(dateNaissance) {
      const naissance = new Date(dateNaissance);
      const aujourdHui = new Date();
      let age = aujourdHui.getFullYear() - naissance.getFullYear();
      const m = aujourdHui.getMonth() - naissance.getMonth();
      if (m < 0 || (m === 0 && aujourdHui.getDate() < naissance.getDate())) {
        age--;
      }
      return age;
    }

    const patientProfil = {
      ...patientData,
      age: calculerAge(patientData.date_naissance),
    };

    // Redirection vers la page patient avec les données
    navigate("/patient", { state: { patient: patientProfil } });
  };

  // Micro-interaction underline animée
  const handleFocus = (idx) => {
    if (inputRefs.current[idx]) inputRefs.current[idx].classList.add("is-focus");
  };
  const handleBlur = (idx) => {
    if (inputRefs.current[idx]) inputRefs.current[idx].classList.remove("is-focus");
  };

  return (
    <div className="auth__wrapper">
      {/* Logo & retour */}
      <div className="auth__logo-retour">
        {(screen === "signup" || screen === "login") && (
          <button
            aria-label="Retour"
            className="auth__btn auth__btn--link"
            onClick={handleBackLanding}
            tabIndex={0}
          >
            ← Retour
          </button>
        )}
      </div>
      <div className="auth__brand">SantéAI_authentification</div>
      {/* Magic Divider */}
      <MagicDivider screen={screen} />

      {/* Illustrations dynamiques */}
      <AssistantIllustration screen={screen} />
      <LoginIllustration screen={screen} />
      <LandingVideo screen={screen} />

      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.section
            key="landing"
            {...variants.landing}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="auth__section"
            style={{ gap: "6vh" }}
          >
            <h1 className="auth__title">
              Vivez l’expérience SantéAI
            </h1>
            <ul className="auth__bullets">
              <li>
                <span style={{ minWidth: 28, display: "flex", justifyContent: "center" }}>{IconSearch}</span>
                <span style={{ flex: 1, display: "block" }}>Diagnostic IA instantané</span>
              </li>
              <li>
                <span style={{ minWidth: 28, display: "flex", justifyContent: "center" }}>{IconFolder}</span>
                <span style={{ flex: 1, display: "block" }}>Dossier santé sécurisé</span>
              </li>
              <li>
                <span style={{ minWidth: 28, display: "flex", justifyContent: "center" }}>{IconVideo}</span>
                <span style={{ flex: 1, display: "block" }}>Téléconsultation en un clic</span>
              </li>
            </ul>
            <motion.button
              aria-label="Essayer cette expérience optimale"
              className="auth__btn"
              whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(59,130,246,.18)" }}
              whileTap={{ y: 0, boxShadow: "0 2px 8px #3b82f622" }}
              onClick={handleStart}
            >
              Essayer cette expérience optimale
            </motion.button>
            <button
              aria-label="Se connecter"
              className="auth__btn auth__btn--link"
              onClick={handleToLogin}
              tabIndex={0}
            >
              J’ai déjà un compte ? Se connecter
            </button>
          </motion.section>
        )}

        {screen === "signup" && (
          <motion.section
            key="signup"
            {...variants.signup}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="auth__section"
            style={{ gap: "4vh" }}
          >
            <h2 className="auth__subtitle">Créer mon compte</h2>
            <form
              style={FORM_MAX}
              className="auth__form"
              onSubmit={handleSignup}
              autoComplete="off"
            >
              <div style={{
                display: "flex",
                gap: 44,
                flexWrap: "wrap",
                width: "100%",
                justifyContent: "center"
              }}>
                {/* Colonne 1 */}
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="text"
                      aria-label="Nom"
                      placeholder="Nom"
                      value={signup.nom}
                      ref={el => (inputRefs.current[0] = el)}
                      onFocus={() => handleFocus(0)}
                      onBlur={() => handleBlur(0)}
                      onChange={e => setSignup(s => ({ ...s, nom: e.target.value }))}
                      required
                      minLength={2}
                    />
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="date"
                      aria-label="Date de naissance"
                      placeholder="Date de naissance"
                      value={signup.date_naissance}
                      ref={el => (inputRefs.current[2] = el)}
                      onFocus={() => handleFocus(2)}
                      onBlur={() => handleBlur(2)}
                      onChange={e => setSignup(s => ({ ...s, date_naissance: e.target.value }))}
                      required
                    />
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="email"
                      aria-label="Email"
                      placeholder="Email"
                      value={signup.email}
                      ref={el => (inputRefs.current[5] = el)}
                      onFocus={() => handleFocus(5)}
                      onBlur={() => handleBlur(5)}
                      onChange={e => setSignup(s => ({ ...s, email: e.target.value }))}
                      required
                    />
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="password"
                      aria-label="Mot de passe"
                      placeholder="Mot de passe"
                      value={signup.mot_de_passe}
                      ref={el => (inputRefs.current[6] = el)}
                      onFocus={() => handleFocus(6)}
                      onBlur={() => handleBlur(6)}
                      onChange={e => setSignup(s => ({ ...s, mot_de_passe: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <span className="auth__input-anim" />
                  </div>
                </div>
                {/* Colonne 2 */}
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="text"
                      aria-label="Prénom"
                      placeholder="Prénom"
                      value={signup.prenom}
                      ref={el => (inputRefs.current[1] = el)}
                      onFocus={() => handleFocus(1)}
                      onBlur={() => handleBlur(1)}
                      onChange={e => setSignup(s => ({ ...s, prenom: e.target.value }))}
                      required
                      minLength={2}
                    />
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <select
                      className="auth__input"
                      aria-label="Genre"
                      value={signup.genre}
                      ref={el => (inputRefs.current[3] = el)}
                      onFocus={() => handleFocus(3)}
                      onBlur={() => handleBlur(3)}
                      onChange={e => setSignup(s => ({ ...s, genre: e.target.value }))}
                      required
                    >
                      <option value="">Genre</option>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                      {/* <option value="Autre">Autre</option> */}
                    </select>
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="tel"
                      aria-label="Numéro de téléphone"
                      placeholder="Numéro de téléphone"
                      value={signup.numero_telephone}
                      ref={el => (inputRefs.current[4] = el)}
                      onFocus={() => handleFocus(4)}
                      onBlur={() => handleBlur(4)}
                      onChange={e => setSignup(s => ({ ...s, numero_telephone: e.target.value }))}
                      required
                      minLength={8}
                    />
                    <span className="auth__input-anim" />
                  </div>
                  <div className="auth__input-wrapper">
                    <input
                      className="auth__input"
                      type="password"
                      aria-label="Confirmation du mot de passe"
                      placeholder="Confirmation du mot de passe"
                      value={signup.confirmation_mot_de_passe}
                      ref={el => (inputRefs.current[7] = el)}
                      onFocus={() => handleFocus(7)}
                      onBlur={() => handleBlur(7)}
                      onChange={e => setSignup(s => ({ ...s, confirmation_mot_de_passe: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <span className="auth__input-anim" />
                  </div>
                </div>
              </div>
              {/* CGU, erreurs et boutons restent en dessous */}
              <label className="auth__cgu">
                <input
                  type="checkbox"
                  aria-label="Accepter les CGU"
                  checked={signup.cgu}
                  onChange={e => setSignup(s => ({ ...s, cgu: e.target.checked }))}
                  required
                  style={{
                    accentColor: "#10b981",
                    width: 18,
                    height: 18
                  }}
                />
                J’accepte les CGU
              </label>
              {error && (
                <div className="auth__error">{error}</div>
              )}
              <motion.button
                aria-label="S’inscrire"
                className="auth__btn"
                whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(16,185,129,.18)" }}
                whileTap={{ y: 0, boxShadow: "0 2px 8px #10b98122" }}
                type="submit"
              >
                S’inscrire
              </motion.button>
              <button
                aria-label="Déjà inscrit ? Se connecter"
                type="button"
                className="auth__btn auth__btn--link"
                onClick={handleToLogin}
                tabIndex={0}
              >
                Déjà inscrit ? Se connecter
              </button>
            </form>
          </motion.section>
        )}

        {screen === "login" && (
          <motion.section
            key="login"
            {...variants.login}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            className="auth__section"
            style={{ gap: "4vh" }}
          >
            <h2 className="auth__subtitle">Se connecter</h2>
            <form
              style={FORM_MAX}
              className="auth__form"
              onSubmit={handleLogin}
              autoComplete="off"
            >
              <div className="auth__input-wrapper">
                <input
                  className="auth__input"
                  type="email"
                  aria-label="Courriel"
                  placeholder="Courriel"
                  value={login.courriel} // <-- correction ici
                  ref={el => (inputRefs.current[6] = el)}
                  onFocus={() => handleFocus(6)}
                  onBlur={() => handleBlur(6)}
                  onChange={e => setLogin(l => ({ ...l, courriel: e.target.value }))} // <-- correction ici
                  required
                />
                <span className="auth__input-anim" />
              </div>
              <div className="auth__input-wrapper">
                <input
                  className="auth__input"
                  type="password"
                  aria-label="Mot de passe"
                  placeholder="Mot de passe"
                  value={login.mot_de_passe}
                  ref={el => (inputRefs.current[7] = el)}
                  onFocus={() => handleFocus(7)}
                  onBlur={() => handleBlur(7)}
                  onChange={e => setLogin(l => ({ ...l, mot_de_passe: e.target.value }))}
                  required
                  minLength={6}
                />
                <span className="auth__input-anim" />
              </div>
              {error && (
                <div className="auth__error">{error}</div>
              )}
              <motion.button
                aria-label="Connexion"
                className="auth__btn"
                whileHover={{ y: -2, boxShadow: "0 6px 18px rgba(59,130,246,.18)" }}
                whileTap={{ y: 0, boxShadow: "0 2px 8px #3b82f622" }}
                type="submit"
              >
                Connexion
              </motion.button>
              <button
                aria-label="Créer un compte"
                type="button"
                className="auth__btn auth__btn--link"
                onClick={handleToSignup}
                tabIndex={0}
              >
                Nouveau ? Créer un compte
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>


      {/* === Liens importants en bas === */}
      {screen === "landing" && (
        <footer style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          margin: "2.5rem auto 1.5rem auto",
          flexWrap: "wrap"
        }}>
          <a href="/cgu" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="CGU">📄</span> CGU
          </a>
          <a href="/confidentialite" style={{ color: "#10b981", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="Confidentialité">🔒</span> Confidentialité
          </a>
          <a href="/contact" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="Contact">📬</span> Contact
          </a>
          <a href="/faq" style={{ color: "#f59e42", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
            <span role="img" aria-label="FAQ">❓</span> FAQ
          </a>
        </footer>
      )}
    </div>
  );
}