import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { getProfilUtilisateur } from "../services/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", mot_de_passe: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.mot_de_passe
      );

      const idToken = await userCredential.user.getIdToken();

      const res = await getProfilUtilisateur(idToken);

      if (res.error) setMessage(res.error);
      else setMessage(`Bienvenue UID : ${res.uid}`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handleChange} />
        <button type="submit">Se connecter</button>
      </form>
      <p>{message}</p>
    </div>
  );
}