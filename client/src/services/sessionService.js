import axios from "axios";
import { getDeviceInfo } from "../utils/deviceDetection";

const API_URL = import.meta.env.VITE_API_URL;

// Add a better error handler function
const handleRequestError = (error, defaultMessage) => {
	// Check if it's a server response error
	if (error.response) {
		// The server responded with a status code outside the 2xx range
		const errorMessage = error.response.data?.message || defaultMessage;
		return {
			success: false,
			message: errorMessage,
			status: error.response.status,
		};
	}

	// The request was made but no response was received
	else if (error.request) {
		return {
			success: false,
			message: "Aucune réponse du serveur. Vérifiez votre connexion internet.",
			isConnectionError: true,
		};
	}

	// Something happened in setting up the request
	else {
		return { success: false, message: error.message || defaultMessage };
	}
};

// Récupérer les sessions actives d'un utilisateur
export const getUserSessions = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		console.log("Fetching sessions for user:", userId);
		const response = await axios.get(
			`${API_URL}/api/users/sessions/${userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		console.log("Sessions retrieved:", response.data.length);
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Error fetching sessions:", error);

		// Detailed error logging
		if (error.response) {
			console.error("Server response error:", {
				status: error.response.status,
				data: error.response.data,
			});
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request setup error:", error.message);
		}

		return handleRequestError(
			error,
			"Erreur lors de la récupération des sessions"
		);
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
		return handleRequestError(
			error,
			"Erreur lors de la terminaison de la session"
		);
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
		return handleRequestError(
			error,
			"Erreur lors de la terminaison des sessions"
		);
	}
};

// Créer une nouvelle session avec informations détaillées
export const createSession = async (userId) => {	
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		// Collect detailed information about the device
		const deviceInfo = await getDeviceInfo();
		console.log("Creating session with device info:", deviceInfo);

		const response = await axios.post(
			`${API_URL}/api/users/sessions/${userId}`,
			{ deviceInfo },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		// Store the session ID and creation time in localStorage
		if (response.data && response.data.id) {
			localStorage.setItem("sessionId", response.data.id);
			localStorage.setItem("sessionCreatedAt", new Date().toISOString());
			console.log(
				"Session created and stored in localStorage:",
				response.data.id
			);
		} else {
			console.warn("Session created but no ID returned:", response.data);
		}

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Error creating session:", error);

		// Detailed error logging
		if (error.response) {
			console.error("Server response error:", {
				status: error.response.status,
				data: error.response.data,
			});
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request setup error:", error.message);
		}

		return handleRequestError(
			error,
			"Erreur lors de la création de la session"
		);
	}
};

// Mettre à jour l'activité de la session
export const updateSessionActivity = async (sessionId) => {
	const token = localStorage.getItem("token");
	if (!token || !sessionId) {
		return { success: false };
	}

	try {
		await axios.put(
			`${API_URL}/api/users/sessions/${sessionId}/activity`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return { success: true };
	} catch (error) {
		console.error("Erreur mise à jour activité session :", error);
		return { success: false };
	}
};

// Vérifier si une session est suspecte
export const checkSuspiciousSession = async (sessionId) => {
	const token = localStorage.getItem("token");
	if (!token || !sessionId) {
		return { success: false };
	}

	try {
		const response = await axios.get(
			`${API_URL}/api/users/sessions/${sessionId}/security-check`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return {
			success: true,
			isSuspicious: response.data.isSuspicious,
			reasons: response.data.reasons,
		};
	} catch (error) {
		return handleRequestError(
			error,
			"Erreur lors de la vérification de la session"
		);
	}
};

// Obtenir les statistiques de session
export const getSessionStats = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.get(
			`${API_URL}/api/users/sessions/${userId}/stats`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return { success: true, data: response.data };
	} catch (error) {
		return handleRequestError(
			error,
			"Erreur lors de la récupération des statistiques"
		);
	}
};

// Calculer la durée de la session actuelle
export const getCurrentSessionDuration = () => {
	try {
		const sessionCreatedAt = localStorage.getItem("sessionCreatedAt");
		if (!sessionCreatedAt) {
			return null;
		}

		const startTime = new Date(sessionCreatedAt).getTime();
		const currentTime = new Date().getTime();
		const durationMs = currentTime - startTime;

		// Convertir en format lisible
		const seconds = Math.floor(durationMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}j ${hours % 24}h`;
		} else if (hours > 0) {
			return `${hours}h ${minutes % 60}m`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds % 60}s`;
		} else {
			return `${seconds}s`;
		}
	} catch (error) {
		console.error("Erreur lors du calcul de la durée de session:", error);
		return "Durée inconnue";
	}
};

export default {
	getUserSessions,
	terminateSession,
	terminateAllSessions,
	createSession,
	updateSessionActivity,
	checkSuspiciousSession,
	getSessionStats,
	getCurrentSessionDuration,
};
