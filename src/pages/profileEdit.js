import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaHeartbeat } from "react-icons/fa";

// Google Fonts (Inter)
const fontFamily = `'Inter', system-ui, sans-serif`;

const STEPS = [
  {
    key: "infos",
    label: "Infos personnelles",
    questions: [
      { name: "prenom", label: "Prénom", type: "text", placeholder: "Votre prénom" },
      { name: "nom", label: "Nom", type: "text", placeholder: "Votre nom de famille" },
      { name: "dateNaissance", label: "Date de naissance", type: "date", placeholder: "JJ/MM/AAAA" },
      { name: "sexe", label: "Sexe", type: "radio", options: ["Homme", "Femme", "Autre"] },
      { name: "email", label: "Adresse e‑mail", type: "email", placeholder: "exemple@email.com" },
      { name: "telephone", label: "Téléphone", type: "tel", placeholder: "07 00 00 00 00" },
      { name: "adresse", label: "Adresse postale", type: "text", placeholder: "Votre adresse" },
    ],
  },
  {
    key: "medical",
    label: "Données médicales",
    questions: [
      { name: "groupeSanguin", label: "Groupe sanguin", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], placeholder: "Sélectionnez" },
      { name: "taille", label: "Taille (en cm)", type: "number", placeholder: "Votre taille en cm" },
      { name: "poids", label: "Poids (en kg)", type: "number", placeholder: "Votre poids en kg" },
      { name: "allergies", label: "Allergies", type: "textarea", placeholder: "Listez vos allergies (séparées par une virgule)" },
      { name: "pathologies", label: "Pathologies chroniques", type: "textarea", placeholder: "Listez vos pathologies (séparées par une virgule)" },
    ],
  },
  {
    key: "urgence",
    label: "Contact d’urgence",
    questions: [
      { name: "urgenceNom", label: "Nom & prénom", type: "text", placeholder: "Nom et prénom du contact" },
      { name: "urgenceLien", label: "Lien de parenté / rôle", type: "text", placeholder: "Ex : frère, mère, ami..." },
      { name: "urgenceTel", label: "Téléphone de contact", type: "tel", placeholder: "07 00 00 00 00" },
      { name: "urgenceEmail", label: "Adresse e‑mail", type: "email", placeholder: "contact@email.com" },
      { name: "medecinTraitant", label: "Médecin traitant (optionnel)", type: "text", placeholder: "Nom du médecin" },
    ],
  },
];

// StepperHorizontal : ligne animée + labels d’étape
function StepperHorizontal({ step }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      margin: "0 auto 3.5rem auto",
      position: "relative",
      minHeight: 80,
      userSelect: "none"
    }}>
      {/* Ligne principale */}
      <motion.div
        layout
        initial={false}
        animate={{
          scaleY: step === 1 ? 0 : 1,
          scaleX: step === 2 ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{
          position: "absolute",
          top: 44,
          left: "8vw",
          right: "8vw",
          height: 10,
          background: "linear-gradient(90deg,#3b82f6 60%,#10b981 100%)",
          borderRadius: 8,
          zIndex: 1,
          transformOrigin: "center",
        }}
      />
      {/* Labels */}
      {STEPS.map((s, idx) => (
        <div key={s.key} style={{
          flex: 1,
          textAlign: "center",
          zIndex: 2,
          color: step === idx ? "#3b82f6" : "#64748b",
          fontWeight: step === idx ? 700 : 500,
          fontSize: step === idx ? "1.35rem" : "1.13rem",
          letterSpacing: ".2px",
          background: "transparent",
        }}>
          <div style={{
            width: 48, height: 48, margin: "0 auto 0.5rem auto",
            borderRadius: "50%",
            background: step === idx ? "#e0f2fe" : "#f1f5f9",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: step === idx ? "3px solid #3b82f6" : "2px solid #e0eafc",
            boxShadow: step === idx ? "0 2px 12px #3b82f633" : "none",
            fontSize: "1.25rem",
            transition: "all .2s"
          }}>
            <span style={{ fontWeight: 700 }}>{idx + 1}</span>
          </div>
          {s.label}
        </div>
      ))}
      {/* Trait vertical pour étape 2 */}
      <motion.div
        initial={false}
        animate={{
          scaleY: step === 1 ? 1 : 0,
          scaleX: step === 1 ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{
          position: "absolute",
          left: 0,
          top: 44,
          width: 10,
          height: 140,
          background: "linear-gradient(180deg,#3b82f6 60%,#10b981 100%)",
          borderRadius: 8,
          zIndex: 1,
          transformOrigin: "top",
        }}
      />
      {/* Trait horizontal bas pour étape 3 */}
      <motion.div
        initial={false}
        animate={{
          scaleX: step === 2 ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{
          position: "absolute",
          left: "8vw",
          right: "8vw",
          bottom: -28,
          height: 10,
          background: "linear-gradient(90deg,#10b981 0%,#3b82f6 100%)",
          borderRadius: 8,
          zIndex: 1,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

// QuestionZone : une question à la fois, animée, full width
function QuestionZone({ step, questionIdx, formData, setFormData, onNext, onPrev }) {
  const question = STEPS[step].questions[questionIdx];
  const [touched, setTouched] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setTouched(false);
    if (inputRef.current) inputRef.current.focus();
  }, [questionIdx, step]);

  // Validation simple
  const value = formData[question.name] || "";
  const isValid = question.type === "email"
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    : question.type === "tel"
      ? value.length >= 8
      : value !== "" || (question.name === "medecinTraitant"); // médecin traitant optionnel

  // Gestion input dynamique
  let inputField = null;
  const inputStyle = {
    width: "100%",
    maxWidth: 600,
    padding: "2rem 2.2rem",
    borderRadius: 18,
    border: isValid && touched ? "3px solid #10b981" : "3px solid #e0eafc",
    outline: "none",
    fontSize: "1.45rem",
    fontFamily,
    background: "#f6fafe",
    marginTop: 18,
    marginBottom: 12,
    boxShadow: isValid && touched ? "0 0 0 4px #10b98133" : "none",
    transition: "border .2s, box-shadow .2s"
  };

  if (question.type === "select") {
    inputField = (
      <select
        ref={inputRef}
        name={question.name}
        value={value}
        onChange={e => { setFormData(d => ({ ...d, [question.name]: e.target.value })); setTouched(true); }}
        style={inputStyle}
        tabIndex={1}
      >
        <option value="">Sélectionner</option>
        {question.options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  } else if (question.type === "radio") {
    inputField = (
      <div style={{ display: "flex", gap: "3rem", marginTop: 18 }}>
        {question.options.map(opt => (
          <label key={opt} style={{
            display: "flex", alignItems: "center", gap: 12,
            fontWeight: 600, color: "#222", cursor: "pointer", fontSize: "1.25rem"
          }}>
            <input
              ref={value === opt ? inputRef : null}
              type="radio"
              name={question.name}
              value={opt}
              checked={value === opt}
              onChange={e => { setFormData(d => ({ ...d, [question.name]: e.target.value })); setTouched(true); }}
              style={{
                accentColor: "#3b82f6",
                width: 24, height: 24, marginRight: 8
              }}
              tabIndex={1}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  } else if (question.type === "textarea") {
    inputField = (
      <textarea
        ref={inputRef}
        name={question.name}
        value={value}
        onChange={e => { setFormData(d => ({ ...d, [question.name]: e.target.value })); setTouched(true); }}
        style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
        placeholder={question.placeholder}
        tabIndex={1}
      />
    );
  } else {
    inputField = (
      <input
        ref={inputRef}
        name={question.name}
        type={question.type}
        value={value}
        onChange={e => { setFormData(d => ({ ...d, [question.name]: e.target.value })); setTouched(true); }}
        style={inputStyle}
        placeholder={question.placeholder}
        tabIndex={1}
        autoComplete="off"
        onBlur={() => setTouched(true)}
        onKeyDown={e => {
          if (e.key === "Enter" && isValid) {
            e.preventDefault();
            onNext();
          }
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.name}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
        style={{
          width: "100vw",
          minHeight: "calc(100vh - 220px)",
          background: "none",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >
        <label htmlFor={question.name} style={{
          fontWeight: 700,
          fontSize: "2.1rem",
          color: "#222",
          marginBottom: 8,
          letterSpacing: ".1px",
          textShadow: "0 2px 8px #3b82f611"
        }}>
          {question.label}
        </label>
        {inputField}
        {/* Validation check */}
        {isValid && touched && (
          <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: "1.15rem" }}>
            <FaCheckCircle /> Valide
          </span>
        )}
        {/* Navigation */}
        <div style={{ display: "flex", width: "100%", maxWidth: 600, justifyContent: "space-between", marginTop: 32 }}>
          {onPrev &&
            <button
              type="button"
              onClick={onPrev}
              style={{
                background: "#e0eafc",
                color: "#3b82f6",
                border: "none",
                borderRadius: 14,
                padding: "1.1rem 2.5rem",
                fontWeight: 700,
                fontSize: "1.25rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px #3b82f611"
              }}
              tabIndex={2}
            >Précédent</button>
          }
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid}
            style={{
              background: isValid ? "#3b82f6" : "#e0eafc",
              color: isValid ? "#fff" : "#64748b",
              border: "none",
              borderRadius: 14,
              padding: "1.1rem 2.5rem",
              fontWeight: 700,
              fontSize: "1.25rem",
              cursor: isValid ? "pointer" : "not-allowed",
              boxShadow: "0 2px 8px #3b82f622",
              marginLeft: "auto",
              opacity: isValid ? 1 : 0.7,
              transition: "background 0.2s"
            }}
            tabIndex={3}
          >
            {questionIdx < STEPS[step].questions.length - 1
              ? "Suivant"
              : step < STEPS.length - 1
                ? `Étape suivante : ${STEPS[step + 1].label} →`
                : "Enregistrer mon profil"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Page principale
export default function ProfileEdit() {
  const [step, setStep] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [formData, setFormData] = useState({});
  const [saved, setSaved] = useState(false);

  // Charger depuis localStorage si dispo
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setFormData(JSON.parse(userData));
  }, []);

  // Gestion navigation
  const handleNext = () => {
    if (questionIdx < STEPS[step].questions.length - 1) {
      setQuestionIdx(q => q + 1);
    } else if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      setQuestionIdx(0);
    } else {
      // Dernière question, sauvegarde
      //   calcule de l'âge
      let age = "";
      if (formData.dateNaissance) {
        const birth = new Date(formData.dateNaissance);
        const now = new Date();
        age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
          age--;
        }
      }
      const dataToSave = { ...formData, age };
      setSaved(true);
      localStorage.setItem("user", JSON.stringify(dataToSave));
      setTimeout(() => window.location.href = "/patient", 1200);
    }
  };
  const handlePrev = () => {
    if (questionIdx > 0) {
      setQuestionIdx(q => q - 1);
    } else if (step > 0) {
      setStep(s => s - 1);
      setQuestionIdx(STEPS[step - 1].questions.length - 1);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#f6fafe",
      fontFamily,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      padding: 0,
      margin: 0,
      overflowX: "hidden"
    }}>
      {/* Header amélioré */}
      <div style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "2.5rem 4vw 0 4vw",
        marginBottom: 0,
        minHeight: 80,
      }}>
        <FaHeartbeat size={38} color="#10b981" style={{ marginRight: 12, filter: "drop-shadow(0 2px 8px #10b98133)" }} />
        <span style={{
          fontFamily,
          fontWeight: 800,
          fontSize: "2.3rem",
          color: "#3b82f6",
          letterSpacing: ".5px",
          textShadow: "0 2px 12px #3b82f633"
        }}>
          Mon profil <span style={{ color: "#10b981" }}>SantAI</span>
        </span>
      </div>

      {/* Stepper */}
      <div style={{ width: "100vw", maxWidth: "100vw", padding: "0 4vw" }}>
        <StepperHorizontal step={step} />
      </div>

      {/* Zone de question dynamique full width */}
      <div style={{
        width: "100vw",
        minHeight: "calc(100vh - 220px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        margin: 0,
        padding: 0,
      }}>
        {!saved ? (
          <QuestionZone
            step={step}
            questionIdx={questionIdx}
            formData={formData}
            setFormData={setFormData}
            onNext={handleNext}
            onPrev={step > 0 || questionIdx > 0 ? handlePrev : undefined}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 2px 32px #10b98122",
              padding: "5rem 2rem",
              textAlign: "center",
              width: "100vw",
              fontSize: "2rem",
              color: "#059669",
              fontWeight: 700,
              marginTop: 40
            }}
          >
            <FaCheckCircle size={54} color="#10b981" style={{ marginBottom: 18 }} />
            Profil enregistré avec succès !<br />
            Redirection...
          </motion.div>
        )}
      </div>
    </div>
  );
}