import React, { useState } from 'react';
import { inscrireUtilisateur } from '../services/api';

function Inscription() {
  const [form, setForm] = useState({
    email: "",
    mot_de_passe: "",
    nom: "",
    prenom: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await inscrireUtilisateur(form);
    setMessage(res.message || res.error || "Erreur lors de l'inscription.");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required /><br />
        <input type="text" name="prenom" placeholder="Prénom" onChange={handleChange} required /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br />
        <input type="password" name="mot_de_passe" placeholder="Mot de passe" onChange={handleChange} required /><br />
        <select name="role" onChange={handleChange} value={form.role}>
          <option value="patient">Patient</option>
          <option value="medecin">Médecin</option>
        </select><br /><br />
        <button type="submit">S'inscrire</button>
      </form>
      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}
    </div>
  );
}

export default Inscription;