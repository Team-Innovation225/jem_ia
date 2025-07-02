export const inscrireUtilisateur = async (userData, idToken) => {
  try {
    const response = await fetch("https://f103-41-202-89-163.ngrok-free.app/auth/inscription/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || "Erreur inconnue" };
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return { error: "Erreur réseau ou serveur" };
  }
};

export const getProfilUtilisateur = async (idToken) => {
  try {
    const response = await fetch("https://f103-41-202-89-163.ngrok-free.app/auth/profil/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`, // ✅ backticks ajoutés
        "ngrok-skip-browser-warning": "true"  // ✅ pour ignorer la page HTML ngrok
      }
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        return { error: errorData.error || "Erreur inconnue" };
      } else {
        const errorText = await response.text();
        console.error("Réponse non JSON (erreur) :", errorText);
        return { error: errorText || "Erreur inconnue (réponse non JSON)" };
      }
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return data;
    } else {
      const text = await response.text();
      console.error("Réponse inattendue du serveur :", text);
      return { error: "Réponse inattendue du serveur", details: text };
    }

  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return { error: "Erreur réseau ou serveur" };
  }
};