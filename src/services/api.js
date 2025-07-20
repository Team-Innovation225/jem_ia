import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA1AKqZs8lkFkbX2vMxYX4ytwocrw3hNHs",
  authDomain: "santeai-b8e44.firebaseapp.com",
  projectId: "santeai-b8e44",
};

initializeApp(firebaseConfig);

const BACKEND_URL = "https://172.16.3.114";
if (!BACKEND_URL) {
  console.error("Erreur: La variable d'environnement REACT_APP_BACKEND_URL n'est pas définie.");
}

// connexion
export const loginPatient = async (email, mot_de_passe) => {
  try {
    const auth = getAuth(getApp());
    const userCredential = await signInWithEmailAndPassword(auth, email, mot_de_passe);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    return { success: true, user, idToken, uid: user.uid, email: user.email };
  } catch (error) {
    let errorMessage = "Erreur de connexion.";
    if (error.code === 'auth/user-not-found') errorMessage = "Aucun utilisateur trouvé avec cet email.";
    else if (error.code === 'auth/wrong-password') errorMessage = "Mot de passe incorrect.";
    else if (error.code === 'auth/invalid-email') errorMessage = "Format d'email invalide.";
    else if (error.code === 'auth/too-many-requests') errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
    return { error: errorMessage };
  }
};

// inscription
export const inscrirePatient = async (userData) => {
  try {
    const auth = getAuth(getApp());
    const currentUser = auth.currentUser;
    if (!currentUser) return { error: "Utilisateur non connecté à Firebase." };
    const idToken = await currentUser.getIdToken();
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register-firebase/`, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` }, body: JSON.stringify(userData)
    });
    if (!response.ok) { const errorData = await response.json(); return { error: errorData.detail || "Erreur lors de l'inscription", status: response.status }; }
    const data = await response.json(); return { data };
  } catch (error) {
    return { error: "Erreur réseau ou serveur." };
  }
};


// structure
export async function createStructure(data, idToken) {
  const response = await fetch(`${BACKEND_URL}/admin-form/structure/`, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}`, "ngrok-skip-browser-warning": "true" }, body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de la structure");
  return await response.json();
}

// profil_patient
export const getPatientProfile = async (firebaseUid, idToken) => {
  try {
    const url = `${BACKEND_URL}/api/v1/patients/${firebaseUid}/`;
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}`, 'ngrok-skip-browser-warning': 'true', }, });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || `Erreur serveur: ${response.status}`); }
    const data = await response.json(); return data;
  } catch (error) {
    throw error;
  }
};


export const updatePatientProfile = async (firebaseUid, formData, idToken) => {
  try {
    const url = `${BACKEND_URL}/patient/patients/${firebaseUid}/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${idToken}`, 'ngrok-skip-browser-warning': 'true', },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text(); let errorData;
      try { errorData = JSON.parse(errorText); } catch (e) { errorData = { detail: `Erreur non JSON: ${errorText}` }; }
      throw new Error(errorData.detail || `Erreur serveur: ${response.status} - ${errorText}`);
    }
    const data = await response.json(); return data;
  } catch (error) {
    return { error: error.message || "Erreur de connexion ou serveur." };
  }
};