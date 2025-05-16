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
		// Afficher le token pour le débogage (à supprimer en production)
		console.log("Token utilisé:", token);

		const response = await axios.get(`${API_URL}/api/users/profile/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur récupération profil :", error);

		// Afficher plus de détails sur l'erreur
		if (error.response) {
			console.error("Détails de l'erreur:", {
				status: error.response.status,
				data: error.response.data,
			});
		}

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

		return { success: true, message: response.data.message };
	} catch (error) {
		console.error("Erreur changement mot de passe :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors du changement de mot de passe";
		return { success: false, message };
	}
};

// Mettre à jour les préférences utilisateur
export const updateUserPreferences = async (userId, preferences) => {
	console.log(preferences);
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.put(
			`${API_URL}/api/users/preferences/${userId}`,
			{ preferences },
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		// Mettre à jour les préférences dans le localStorage
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const updatedUser = { ...currentUser, preferences: preferences };
		localStorage.setItem("user", JSON.stringify(updatedUser));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur mise à jour préférences :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la mise à jour des préférences";
		return { success: false, message };
	}
};

// Exporter les données utilisateur
export const exportUserData = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.get(`${API_URL}/api/users/export/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur exportation données :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de l'exportation des données";
		return { success: false, message };
	}
};

// Supprimer le compte utilisateur
export const deleteAccount = async (userId) => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { success: false, message: "Utilisateur non connecté." };
	}

	try {
		const response = await axios.delete(`${API_URL}/api/users/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { success: true, message: response.data.message };
	} catch (error) {
		console.error("Erreur suppression compte :", error);
		const message =
			error.response?.data?.message ||
			"Erreur lors de la suppression du compte";
		return { success: false, message };
	}
};
// Function to fetch user data including profile pictures
export const fetchUsers = async () => {
	try {
		// In a real app, you would fetch users from your API
		// Example: const response = await fetch('/api/users');
		// const data = await response.json();

		// For now, we'll return mock data
		const users = [
			{
				id: "1",
				name: "Badie dev",
				initials: "BD",
				online: true,
				lastMessage: "👍",
				date: "2023-05-02",
				isYourMessage: true,
				status: "read",
			},
			{
				id: "2",
				name: "mama Ima",
				initials: "MI",
				lastMessage: "hello",
				date: "2023-02-26",
				isYourMessage: true,
				status: "delivered",
			},
			{
				id: "3",
				name: "test User",
				initials: "TU",
				lastMessage: "👍",
				date: "2024-12-12",
				isYourMessage: true,
				status: "delivered",
			},
			{
				id: "4",
				name: "jawad amohoche",
				initials: "JA",
				lastMessage: "hello",
				date: "2024-05-03",
				isYourMessage: false,
			},
			{
				id: "5",
				name: "Marguerite Campbell",
				initials: "MC",
				online: true,
				lastMessage: "Let's discuss the project tomorrow",
				date: "2024-05-01",
				isYourMessage: false,
			},
		];

		// Fetch profile pictures for each user
		const usersWithProfilePictures = await Promise.all(
			users.map(async (user) => {
				const profilePicture = await getUserProfilePicture(user.id);
				return {
					...user,
					avatar: profilePicture,
				};
			})
		);

		return usersWithProfilePictures;
	} catch (error) {
		console.error("Error fetching users:", error);
		return [];
	}
};
// Function to upload a profile picture to the database
export const uploadProfilePicture = async (userId, imageFile) => {
	try {
		// In a real app, you would upload the file to your server/cloud storage
		// Example with FormData:
		// const formData = new FormData();
		// formData.append('profilePicture', imageFile);
		// const response = await fetch(`/api/users/${userId}/profile-picture`, {
		//   method: 'POST',
		//   body: formData
		// });
		// const data = await response.json();
		// return data.imageUrl;

		// For now, we'll convert it to a data URL and store in localStorage
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const imageUrl = reader.result;
				// Store in localStorage as a cache
				localStorage.setItem(`profile_picture_${userId}`, imageUrl);
				resolve(imageUrl);
			};
			reader.readAsDataURL(imageFile);
		});
	} catch (error) {
		console.error("Error uploading profile picture:", error);
		throw new Error("Failed to upload profile picture");
	}
};
// Function to fetch user profile picture from the database
export const getUserProfilePicture = async (userId) => {
	try {
		// In a real app, you would fetch the profile picture from your API
		// Example: const response = await fetch(`/api/users/${userId}/profile-picture`);

		// For now, we'll simulate fetching from localStorage or a mock database
		const mockDatabase = {
			1: "/placeholder.svg?height=40&width=40", // Replace with actual image URLs in your implementation
			2: "/placeholder.svg?height=40&width=40",
			3: "/placeholder.svg?height=40&width=40",
			4: "/placeholder.svg?height=40&width=40",
			5: "/placeholder.svg?height=40&width=40",
		};

		// Check if we have a cached profile picture in localStorage
		const cachedPicture = localStorage.getItem(`profile_picture_${userId}`);
		if (cachedPicture) {
			return cachedPicture;
		}

		// Otherwise return from our mock database
		return mockDatabase[userId] || null;
	} catch (error) {
		console.error("Error fetching profile picture:", error);
		return null;
	}
};
