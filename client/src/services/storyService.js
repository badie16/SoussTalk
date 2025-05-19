import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Intercepteur pour gérer les erreurs de connexion réseau
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (!error.response) {
			console.log(
				"Erreur de connexion détectée, redirection vers la page d'erreur"
			);
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
		const message =
			error.response?.data?.message ||
			error.response?.data?.error ||
			"Erreur serveur";
		return { success: false, message };
	}
};

// 🔹 Récupérer les stories actives (uniquement des amis)
export const getActiveStories = async () => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	try {
		const response = await axios.get(`${API_URL}/api/stories/friends`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération stories :", error);
		if (!error.response) {
			return {
				success: false,
				message: "Problème de connexion",
				isConnectionError: true,
			};
		}
		return {
			success: false,
			message: error.response?.data?.message || "Erreur serveur",
		};
	}
};

// 🔹 Récupérer les stories d'un utilisateur spécifique
export const getUserStories = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	try {
		const response = await axios.get(`${API_URL}/api/stories/user/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération stories utilisateur :", error);
		return {
			success: false,
			message: error.response?.data?.message || "Erreur serveur",
		};
	}
};

// 🔹 Marquer une story comme vue
export const markStoryAsViewed = async (storyId) => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	try {
		const response = await axios.post(
			`${API_URL}/api/stories/${storyId}/view`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur marquage story comme vue :", error);
		return {
			success: false,
			message: error.response?.data?.message || "Erreur serveur",
		};
	}
};

// 🔹 Récupérer les stories vues par l'utilisateur
export const getViewedStories = async () => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	try {
		const response = await axios.get(`${API_URL}/api/stories/viewed`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération stories vues :", error);
		return {
			success: false,
			message: error.response?.data?.message || "Erreur serveur",
		};
	}
};

export const uploadMedia = async (file) => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	const formData = new FormData();
	formData.append("media", file);

	try {
		const response = await axios.post(`${API_URL}/api/upload/story`, formData, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data.url;
	} catch (error) {
		console.error("Erreur upload média :", error);
		throw new Error(error.response?.data?.message || "Erreur lors de l'upload");
	}
};

// 🔹 Supprimer une story
export const deleteStory = async (storyId) => {
	const token = localStorage.getItem("token");
	if (!token) return { success: false, message: "Utilisateur non authentifié" };

	try {
		const response = await axios.delete(`${API_URL}/api/stories/${storyId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur suppression story :", error);
		return {
			success: false,
			message: error.response?.data?.message || "Erreur serveur",
		};
	}
};
