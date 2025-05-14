import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log(API_URL);

// Vérifier si l'utilisateur est connecté
export const isLoggedIn = () => {
	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");
	return !!token && !!user;
};

// Obtenir les infos du profil utilisateur depuis la base de données Supabase
export const getUserProfile = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) throw new Error("Utilisateur non connecté.");

	try {
		const response = await axios.get(`${API_URL}/api/users/profile/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération profil :", error);
		const message = error.response?.data?.message || "Erreur profil";
		return { success: false, message };
	}
};
