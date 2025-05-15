import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Vérifier si l'utilisateur est connecté
export const isLoggedIn = () => {
	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");
	return !!token && !!user;
};

// Obtenir les infos du profil utilisateur depuis la base de données Supabase
export const getUserProfile = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

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

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (userId, userData) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.put(
			`${API_URL}/api/users/profile/${userId}`,
			userData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		// Mettre à jour les données utilisateur dans le localStorage
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const updatedUser = { ...currentUser, ...response.data };
		localStorage.setItem("user", JSON.stringify(updatedUser));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur mise à jour profil :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la mise à jour du profil";
		return { success: false, message };
	}
};

// Télécharger et mettre à jour l'avatar de l'utilisateur
export const updateUserAvatar = async (userId, file) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	// Vérifier le type et la taille du fichier
	if (!file.type.startsWith("image/")) {
		return { success: false, message: "Le fichier doit être une image." };
	}

	if (file.size > 2 * 1024 * 1024) {
		return { success: false, message: "L'image ne doit pas dépasser 2 Mo." };
	}

	try {
		const formData = new FormData();
		formData.append("avatar", file);

		const response = await axios.post(
			`${API_URL}/api/users/avatar/${userId}`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			}
		);

		// Mettre à jour l'avatar dans le localStorage
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const updatedUser = {
			...currentUser,
			avatar_url: response.data.avatar_url,
		};
		localStorage.setItem("user", JSON.stringify(updatedUser));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur téléchargement avatar :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors du téléchargement de l'avatar";
		return { success: false, message };
	}
};

// Changer le mot de passe de l'utilisateur
export const changePassword = async (userId, currentPassword, newPassword) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.put(
			`${API_URL}/api/users/password/${userId}`,
			{ currentPassword, newPassword },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur changement mot de passe :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors du changement de mot de passe";
		return { success: false, message };
	}
};
