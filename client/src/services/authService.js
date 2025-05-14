import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log(API_URL)
//  Vérifier si l'utilisateur est connecté
export const isLoggedIn = () => {
	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");
	return !!token && !!user;
};

//  Obtenir les infos utilisateur
export const getCurrentUser = () => {
	const user = localStorage.getItem("user");
	return user ? JSON.parse(user) : null;
};

//  Connexion
export const login = async (formData) => {
	try {
		
		const response = await axios.post(`${API_URL}/api/auth/login`, formData);

		// Stocker le token et les données utilisateur
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur login :", error);

		const message = error.response?.data?.message || "Échec de la connexion";

		return {
			success: false,
			message,
		};
	}
};

//  Déconnexion
export const logout = async () => {
	const token = localStorage.getItem("token");

	try {
		if (token) {
			await axios.post(
				`${API_URL}/api/auth/logout`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
		}
	} catch (error) {
		console.error("Erreur de déconnexion :", error);
	} finally {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	}
};

//  Inscription
export const signup = async (userData) => {
	
	try {
		const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur signup :", error.message);

		const message = error.response?.data?.message || "Échec de l'inscription";

		return {
			success: false,
			message,
		};
	}
};

//  Mettre à jour le statut en ligne
export const updateOnlineStatus = async (isOnline) => {
	const token = localStorage.getItem("token");
	if (!token) return;

	try {
		await axios.put(
			`${API_URL}/api/users/status`,
			{ online: isOnline },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
	} catch (error) {
		console.error("Erreur statut en ligne :", error);
	}
};

//  Détection automatique de statut en ligne / hors ligne
export const setupOnlineStatusListener = () => {
	window.addEventListener("online", () => updateOnlineStatus(true));
	window.addEventListener("offline", () => updateOnlineStatus(false));
	// Initialiser au chargement
	updateOnlineStatus(navigator.onLine);
};
