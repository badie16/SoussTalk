import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Vérifier si l'utilisateur est connecté

// Mettre à jour le statut en ligne

// Connexion
export const login = async (formData) => {
	try {
		const response = await axios.post(`${API_URL}/auth/login`, formData);
		
		// Stocker le token et les données utilisateur
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		return { success: true, data: response.data };
	} catch (error) { 
		return {
			success: false,
			message: error.response?.data?.message || "Échec de la connexion",
		};
	}
};

// Déconnexion
export const logout = async () => {
	const token = localStorage.getItem("token");

	try {
		if (token) {
			await axios.post(
				`${API_URL}/auth/logout`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
		}
	} catch (error) {
		console.error("Logout error:", error);
	} finally {
		// Supprimer les données de session
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	}
};

// Inscription

// Ajouter un gestionnaire d'événements pour mettre à jour le statut en ligne
