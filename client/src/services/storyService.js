import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Intercepteur pour gérer les erreurs de connexion réseau
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.log("Erreur de connexion détectée, redirection vers la page d'erreur");
      sessionStorage.setItem("lastPath", window.location.pathname);
      window.location.href = "/connection-error";
      return Promise.reject(new Error("Erreur de connexion réseau"));
    }
    return Promise.reject(error);
  }
);

// 🔹 Créer une nouvelle story
export const createStory = async (storyData) => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Utilisateur non authentifié" };

  try {
    const response = await axios.post(`${API_URL}/api/stories`, storyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Erreur création story :", error);
    const message = error.response?.data?.message || error.response?.data?.error || "Erreur serveur";
    return { success: false, message };
  }
};

// 🔹 Récupérer les stories actives (équivalent de GET /api/stories)
export const getActiveStories = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, message: "Utilisateur non authentifié" };

  try {
    const response = await axios.get(`${API_URL}/api/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erreur récupération stories :", error);
    if (!error.response) {
      return { success: false, message: "Problème de connexion", isConnectionError: true };
    }
    return { success: false, message: error.response?.data?.message || "Erreur serveur" };
  }
};

    export const uploadMedia = async (file) => {
        const formData = new FormData();
        formData.append("media", file);
      
        try {
          const res = await fetch(`${API_URL}/api/stories`, {
            method: "POST",
            body: formData,
          });
      
          if (!res.ok) {
            const errorData = await res.json();
            return { success: false, message: errorData.message || "Upload failed" };
          }
      
          const data = await res.json();
          return { success: true, data };
        } catch (err) {
          console.error("Upload error:", err);
          return { success: false, message: "Something went wrong during upload" };
        }
      };
// 🔹 Supprimer une story (à condition que le backend gère DELETE /api/stories/:id)


// 🔹 Fonction supprimée ou modifiée : plus d'endpoint /api/stories/active dans backend
// Si besoin, tu peux remplacer getActiveStories par getAllStories

// 🔹 Upload média : à retirer si backend ne gère pas cette route, sinon créer la route backend

