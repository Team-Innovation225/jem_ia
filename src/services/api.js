const BASE_URL = "https://3d06-102-215-255-183.ngrok-free.app";
export const inscrireUtilisateur = async (data) => {
  try {
    const res = await fetch("${BASE_URL}/api/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    return { error: "Erreur réseau ou serveur." };
  }
};