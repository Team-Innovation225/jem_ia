import React, { useState } from "react";
import { inscrireUtilisateur } from "../services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Envoi des données au backend, backend gère la création Firebase + Firestore
      const res = await inscrireUtilisateur(form);

      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage("Inscription réussie !");
        // Optionnel : reset form
        setForm({
          nom: "",
          prenom: "",
          email: "",
          mot_de_passe: "",
          role: "patient",
        });
      }
    } catch (err) {
      setMessage("Erreur inconnue lors de l'inscription.");
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          name="prenom"
          placeholder="Prénom"
          value={form.prenom}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="mot_de_passe"
          type="password"
          placeholder="Mot de passe"
          value={form.mot_de_passe}
          onChange={handleChange}
          required
          minLength={6}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="patient">Patient</option>
          <option value="medecin">Médecin</option>
        </select>
        <button type="submit">S'inscrire</button>
      </form>
      <p>{message}</p>
    </div>
  );
};