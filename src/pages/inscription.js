// import React, { useState } from "react";
// import { inscrireUtilisateur, getProfilUtilisateur } from "../services/api";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../services/firebase";
// import { useNavigate } from "react-router-dom";

// export default function RegisterPage({ onSuccess }) {
//   const [form, setForm] = useState({
//     nom: "",
//     prenom: "",
//     email: "",
//     mot_de_passe: "",
//     role: "", // "patient" ou "medecin"
//   });

//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await inscrireUtilisateur(form);

//       if (res.error) {
//         setMessage(res.error);
//       } else {
//         // Connexion automatique après inscription
//         const userCredential = await signInWithEmailAndPassword(
//           auth,
//           form.email,
//           form.mot_de_passe
//         );
//         const idToken = await userCredential.user.getIdToken();
//         const profil = await getProfilUtilisateur(idToken);
//         if (onSuccess) onSuccess(profil); // Accès direct au chat

//         // Redirection basée sur le rôle
//         if (profil.role === "patient") {
//           // Stocke les infos dans le localStorage ou dans un contexte global
//           localStorage.setItem("user", JSON.stringify(profil));
//           navigate("/userDashbord");
//         } else if (profil.role === "medecin") {
//           navigate("/medecin");
//         } else {
//           setMessage("Erreur : rôle inconnu.");
//         }
//       }
//     } catch (err) {
//       setMessage("Erreur lors de l'inscription ou de la connexion.");
//     }
//   };

//   // Styles modernes
//   const styles = {
//     container: {
//       minHeight: "100vh",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       background: "linear-gradient(120deg, #e0eafc, #cfdef3)",
//     },
//     card: {
//       background: "#fff",
//       padding: "2rem 2.5rem",
//       borderRadius: "16px",
//       boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
//       minWidth: "320px",
//       maxWidth: "50%",
//     },
//     title: {
//       marginBottom: "1.5rem",
//       textAlign: "center",
//       color: "#2d3a4b",
//       fontWeight: 700,
//       fontSize: "1.7rem",
//       letterSpacing: "1px",
//     },
//     input: {
//       width: "100%",
//       padding: "0.8rem",
//       margin: "0.5rem 0",
//       border: "1px solid #d1d5db",
//       borderRadius: "8px",
//       fontSize: "1rem",
//       outline: "none",
//       transition: "border 0.2s",
//     },
//     select: {
//       width: "200px",
//       padding: "0.8rem",
//       margin: "0.5rem 0",
//       border: "1px solid #d1d5db",
//       borderRadius: "8px",
//       fontSize: "1rem",
//       outline: "none",
//       background: "#f9fafb",
//       transition: "border 0.2s",
//     },
//     button: {
//       width: "70%",
//       marginLeft: "15%",
//       padding: "0.9rem",
//       marginTop: "2rem",
//       background: "linear-gradient(90deg, #4f8cff, #38b6ff)",
//       color: "#fff",
//       border: "none",
//       borderRadius: "8px",
//       fontWeight: 600,
//       fontSize: "1.1rem",
//       cursor: "pointer",
//       boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
//       transition: "background 0.2s",
//     },
//     message: {
//       marginTop: "1rem",
//       color: "green",
//       textAlign: "center",
//       minHeight: "1.5em",
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <form style={styles.card} onSubmit={handleSubmit}>
//         <div style={styles.title}>Inscription</div>
//         <input
//           name="nom"
//           placeholder="Nom"
//           value={form.nom}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           name="prenom"
//           placeholder="Prénom"
//           value={form.prenom}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//           style={styles.input}
//         />
//         <input
//           name="mot_de_passe"
//           type="password"
//           placeholder="Mot de passe"
//           value={form.mot_de_passe}
//           onChange={handleChange}
//           required
//           minLength={6}
//           style={styles.input}
//         />
//         <select
//           name="role"
//           value={form.role}
//           onChange={handleChange}
//           required
//           style={styles.select}
//         >
//           <option value="">Sélectionner un rôle</option>
//           <option value="patient">Patient</option>
//           <option value="medecin">Médecin</option>
//         </select>
//         <button type="submit" style={styles.button}>
//           S'inscrire
//         </button>
//         <div style={styles.message}>{message}</div>
//         <div style={{ textAlign: "center", marginTop: "1.2rem", color: "#2563eb" }}>
//           Déjà un compte ?{" "}
//           <a href="/login" style={{ color: "#059669", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
//             Connectez-vous
//           </a>
//         </div>
//       </form>
//     </div>
//   );
// };