import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { createStructure } from "../services/api";
import { useNavigate } from "react-router-dom";

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e0f2fe 0%, #e6fffa 100%)",
  },
  form: {
    background: "#fff",
    borderRadius: "1.5rem",
    boxShadow: "0 8px 32px 0 rgba(46,125,255,0.10)",
    padding: "2.5rem",
    width: "90%",
    maxWidth: 820,
    border: "1px solid #dbeafe",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#2563eb",
    marginBottom: "0.5rem",
    textAlign: "center",
    letterSpacing: "-1px",
  },
  subtitle: {
    textAlign: "center",
    color: "#059669",
    marginBottom: "2rem",
    fontWeight: 500,
  },
  label: {
    display: "block",
    color: "#2563eb",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  input: {
    width: "100%",
    border: "1px solid #bae6fd",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    marginBottom: "1.2rem",
    background: "#f0f9ff",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s",
  },
  select: {
    width: "100%",
    border: "1px solid #bae6fd",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    marginBottom: "1.2rem",
    background: "#f0f9ff",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s",
  },
  button: {
    width: "100%",
    background: "linear-gradient(90deg, #34d399 0%, #2563eb 100%)",
    color: "#fff",
    padding: "0.9rem",
    borderRadius: "0.75rem",
    fontWeight: 700,
    fontSize: "1.1rem",
    border: "none",
    boxShadow: "0 2px 8px rgba(52,211,153,0.08)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  message: {
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: 600,
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline",
    cursor: "pointer",
    marginTop: "1rem",
    display: "block",
    textAlign: "center",
    fontWeight: 600,
  },
};

function StructureLoginForm({ onCancel }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setMessage("");
    // Ici, appelle ton API de connexion structure (à adapter selon ton backend)
    try {
      // Exemple fictif, à remplacer par ta vraie fonction d'auth
      // const res = await loginStructure({ email, motDePasse });
      // if (res.succes) { ... }
      setMessage("Connexion réussie (à implémenter)");
      setTimeout(() => {
        navigate("/administrator");
      }, 1000);
    } catch (err) {
      setMessage("Erreur : " + (err.message || "Connexion impossible"));
    }
  };

  return (
    <form style={styles.form} onSubmit={handleLogin}>
      <h2 style={styles.title}>Connexion à une structure existante</h2>
      <label style={styles.label}>Email de la structure</label>
      <input
        style={styles.input}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="contact@structure.com"
      />
      <label style={styles.label}>Mot de passe</label>
      <input
      style={styles.input}
      name="password"
      type="password"
      value={motDePasse}
      onChange={e => setMotDePasse(e.target.value)}
      required
      placeholder="Mot de passe"
      />
      {message && (
        <div style={{
          ...styles.message,
          color: message.startsWith("Erreur") ? "#dc2626" : "#059669",
        }}>
          {message}
        </div>
      )}
      <button type="submit" style={styles.button}>
        Se connecter
      </button>
      <span style={styles.link} onClick={onCancel}>
        ← Retour à la création de structure
      </span>
    </form>
  );
}

export default function AdminForm() {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    adresse: "",
    email: "",
    telephone: "",
    password: "", // Ajout du champ mot de passe
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      setLoading(true);
      setMessage("");
      try {
        await createStructure(form, idToken);
        setMessage("Structure créée avec succès !");
        setTimeout(() => {
          navigate("/administrator");
        }, 1200);
      } catch (err) {
        // Si le backend retourne une erreur spécifique pour "structure existe déjà"
        if (
          err.message &&
          (err.message.includes("existe déjà") || err.message.includes("already exists"))
        ) {
          setMessage("Erreur : Cette structure existe déjà. Vous pouvez vous connecter à votre espace.");
        } else {
          setMessage("Erreur : " + err.message);
        }
      }
      setLoading(false);
    } else {
      alert("Vous devez être connecté pour effectuer cette action.");
    }
  };

  if (showLogin) {
    return <div style={styles.root}>
      <StructureLoginForm onCancel={() => setShowLogin(false)} />
    </div>;
  }

  return (
    <div style={styles.root}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Nouvelle structure médicale</h2>
        <p style={styles.subtitle}>
          Merci de renseigner les informations de votre établissement.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem", // Augmente l'écart entre les champs
            marginBottom: "1.2rem",
          }}
        >
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Nom de la structure</label>
            <input
              style={styles.input}
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Ex : CHR de Korhogo"
            />
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Type</label>
            <select
              style={styles.select}
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner</option>
              <option value="hopital">Centre Hospitalier Régional</option>
              <option value="Clinique">Clinique</option>
              <option value="Cabinet">Cabinet médical</option>
              <option value="Pharmacie">Pharmacie</option>
              <option value="Laboratoire">Laboratoire d'analyses</option>
              <option value="Centre de santé">Centre de santé</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Adresse</label>
            <input
              style={styles.input}
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              required
              placeholder="Adresse complète"
            />
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Email de contact</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="contact@structure.com"
            />
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Téléphone</label>
            <input
              style={styles.input}
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
              placeholder="Numéro de téléphone"
            />
          </div>
          <div style={{ padding: "0 0.5rem" }}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Définir un mot de passe pour la structure"
            />
          </div>
        </div>
        {message && (
          <div
            style={{
              ...styles.message,
              color: message.startsWith("Erreur") ? "#dc2626" : "#059669",
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <span style={styles.link} onClick={() => setShowLogin(true)}>
          J'ai déjà une structure
        </span>
      </form>
    </div>
  );
}