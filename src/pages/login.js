// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getProfilUtilisateur } from "../services/api";

// export default function LoginPage() {
//   const [form, setForm] = useState({ email: "", password: "" }); // ✅ password correct
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("https://d07b5df2e16d.ngrok-free.app/auth/login/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const result = await response.json();
//       const idToken = result?.firebase?.idToken; // ✅ extraction correcte

//       if (!response.ok || !idToken) {
//         setMessage("Identifiants invalides ou token manquant.");
//         return;
//       }

//       const profil = await getProfilUtilisateur(idToken);
//       console.log("Profil reçu :", profil); // Ajoute ce log

//       if (profil.role === "medecin") {
//         navigate("/medecin");
//       } else if (profil.role === "patient") {
//         navigate("/patient");
//       } else {
//         setMessage("Rôle inconnu.");
//       }
//     } catch (err) {
//       console.error("Erreur :", err);
//       setMessage("Erreur lors de la connexion.");
//     }
//   };

//   // Styles
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
//       minWidth: "300px",
//       maxWidth: "90vh",
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
//     button: {
//       width: "100%",
//       padding: "0.9rem",
//       marginTop: "1rem",
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
//         <div style={styles.title}>Connexion</div>
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           style={styles.input}
//           onChange={handleChange}
//           autoComplete="username"
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Mot de passe"
//           style={styles.input}
//           onChange={handleChange}
//           autoComplete="current-password"
//         />
//         <button type="submit" style={styles.button}>
//           Se connecter
//         </button>
//         <div style={styles.message}>{message}</div>
//         <div style={{ textAlign: "center", marginTop: "1.2rem", color: "#2563eb" }}>
//           Pas encore de compte ?{" "}
//           <a href="/register" style={{ color: "#059669", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
//             Inscrivez-vous
//           </a>
//         </div>
//       </form>
//     </div>
//   );
// }