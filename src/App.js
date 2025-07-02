// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Inscription from "./pages/inscription";
import LogIn from "./pages/login";

// 📄 Composant Accueil — affiché par défaut à "/"
function Accueil() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenue 🏥</h1>
      <p>Ce site permet de diagnostiquer des symptômes en ligne.</p>
      <Link to="/inscription">
        <button>Créer un compte</button>
      </Link>
      <Link to="/LogIn"><button style={{ marginLeft: "1rem" }}>Se connecter</button> </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#e6f2ff" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Accueil</Link>
        <Link to="/inscription">Inscription</Link>
        <Link to="/LogIn">Se connecter</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Accueil />} />             {/* Route par défaut */}
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/LogIn" element={<LogIn />} />
      </Routes>
    </Router>
  );
}

export default App;