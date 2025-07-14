import { getAuth} from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";

// import firebase from "firebase/app";
// import "firebase/auth";
// import { initializeApp } from "firebase/app";
// import firebase from "firebase/app";
// import "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyA1AKqZs8lkFkbX2vMxYX4ytwocrw3hNHs",
  authDomain: "santeai-b8e44.firebaseapp.com",
  projectId: "santeai-b8e44",
  // ...autres paramètres Firebase...
};

initializeApp(firebaseConfig);
// ...existing code...

// src/api/diagnose.js
// export async function converseWithIA(userInput, sessionId = null, context = null, history = null) {
//   const payload = {
//     user_input: userInput,
//     session_id: sessionId,
//     context: context,
//     history: history
//   };
//   const res = await fetch("https://006d750deaff.ngrok-free.app/ia/chat/", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error("Erreur serveur : " + res.status + " → " + errorText);
//   }
//   return await res.json();
// }

// export const loginUtilisateur = async (email, mot_de_passe) => {
//   try {
//     const response = await fetch("https://43433959756d.ngrok-free.app/auth/login/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//       email,
//       password: mot_de_passe, // <-- adapte ici selon le backend
      
//       }),
//     });
//     if (!response.ok) {
//       const errorData = await response.json();
//       return { error: errorData.error || "Identifiants invalides." };
//     }
//     return await response.json(); // { idToken }
//   } catch (error) {
//     return { error: "Erreur réseau ou serveur" };
//   }
// };


export async function createStructure(data, idToken) {
  const response = await fetch("https://564fca1c6c02.ngrok-free.app/admin-form/structure/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`,
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la création de la structure");
  }
  return await response.json();
}

// Inscription patient
// Fonction d'inscription patient
export const inscrirePatient = async (userData) => {
  try {
    const auth = getAuth(getApp());
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { error: "Utilisateur non connecté à Firebase." };
    }

    const idToken = await currentUser.getIdToken();

    console.log("Jeton Firebase utilisé :", idToken);

    const response = await fetch("https://564fca1c6c02.ngrok-free.app/patient/inscription/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.detail || "Erreur lors de l'inscription",
        status: response.status
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Erreur d'inscription :", error);
    return { error: "Erreur réseau ou serveur." };
  }
};

// Connexion patient
// 📦 Imports Firebase modulaire

// ⚡ Fonction d’authentification + envoi backend
export const loginPatient = async (email, mot_de_passe) => {
  try {
    console.log("📡 Tentative de connexion avec :", email);

    const response = await fetch("https://564fca1c6c02.ngrok-free.app/patient/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mot_de_passe })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("❌ Erreur reçue du backend :", result.detail);
      return { error: result.detail || "Erreur inconnue côté serveur" };
    }

    console.log("✅ Réponse backend reçue :", result);
    return result;
  } catch (error) {
    console.error("⛔ Erreur réseau ou fetch :", error);
    return { error: "Erreur de connexion au serveur" };
  }
};