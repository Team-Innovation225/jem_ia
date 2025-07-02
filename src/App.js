// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from "react-router-dom";
import Inscription from "./pages/inscription";
import LogIn from "./pages/login";
import { deconnexion } from "./services/firebase"; // adapte le chemin

// 📄 Composant Accueil — affiché par défaut à "/"
function Accueil() {
  const styles = {
    container: {
      height: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(120deg, #e0eafc, #cfdef3)",
      borderRadius: "16px",
      margin: "2rem auto",
      width: "100%",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      padding: "2.5rem 2rem",
    },
    title: {
      fontSize: "2.2rem",
      fontWeight: 700,
      color: "#2d3a4b",
      marginBottom: "1rem",
      textAlign: "center",
    },
    text: {
      fontSize: "1.1rem",
      color: "#4f4f4f",
      marginBottom: "2rem",
      textAlign: "center",
    },
    button: {
      padding: "0.9rem 2rem",
      margin: "0 0.5rem",
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
    btnGroup: {
      display: "flex",
      justifyContent: "center",
      marginTop: "1rem",
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue 🏥</h1>
      <p style={styles.text}>Ce site permet de diagnostiquer des symptômes en ligne.</p>
      <div style={styles.btnGroup}>
        <Link to="/inscription">
          <button style={styles.button}>Créer un compte</button>
        </Link>
        <Link to="/LogIn">
          <button style={styles.button}>Se connecter</button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  const navStyle = {
    padding: "1rem",
    background: "linear-gradient(90deg, #e0eafc, #cfdef3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
    marginBottom: "2rem",
    borderRadius: "0 0 16px 16px",
  };

  const linkStyle = {
    margin: "0 1rem",
    color: "#2d3a4b",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "1.1rem",
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    transition: "background 0.2s",
  };

  const linkActiveStyle = {
    background: "linear-gradient(90deg, #4f8cff, #38b6ff)",
    color: "#fff"
  };

  const handleLogout = async () => {
    await deconnexion();
    // Redirige vers la page de login ou d'accueil
    window.location.href = "/";
  };

  return (
    <Router>
      <nav style={navStyle}>
        <NavLink
          to="/"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...linkActiveStyle } : linkStyle
          }
          end
        >
          Accueil
        </NavLink>
        <NavLink
          to="/inscription"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...linkActiveStyle } : linkStyle
          }
        >
          Inscription
        </NavLink>
        <NavLink
          to="/LogIn"
          style={({ isActive }) =>
            isActive ? { ...linkStyle, ...linkActiveStyle } : linkStyle
          }
        >
          Se connecter
        </NavLink>
        <button
          style={{ ...linkStyle, background: "#e53e3e", color: "#fff", marginLeft: "2rem" }}
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/LogIn" element={<LogIn />} />
      </Routes>
    </Router>
  );
}

export default App;