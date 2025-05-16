import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Récupérer les sessions actives d'un utilisateur
export const getUserSessions = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.get(
			`${API_URL}/api/users/sessions/${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération sessions :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la récupération des sessions";
		return { success: false, message };
	}
};

// Terminer une session spécifique
export const terminateSession = async (userId, sessionId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.delete(
			`${API_URL}/api/users/sessions/${userId}/${sessionId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { success: true, message: response.data.message };
	} catch (error) {
		console.error("Erreur terminaison session :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la terminaison de la session";
		return { success: false, message };
	}
};

// Terminer toutes les sessions d'un utilisateur (sauf la session courante)
export const terminateAllSessions = async (userId) => {
	const token = localStorage.getItem("token");
	const currentSessionId = localStorage.getItem("sessionId");

	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.delete(
			`${API_URL}/api/users/sessions/all/${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				data: { currentSessionId },
			}
		);

		return { success: true, message: response.data.message };
	} catch (error) {
		console.error("Erreur terminaison toutes sessions :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la terminaison des sessions";
		return { success: false, message };
	}
};

export default {
	getUserSessions,
	terminateSession,
	terminateAllSessions,
};
