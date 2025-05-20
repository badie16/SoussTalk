import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getTokenHeaders = () => {
	const token = localStorage.getItem("token");
	if (!token) {
		throw new Error("Utilisateur non connecté.");
	}
	return { Authorization: `Bearer ${token}` };
};

// Récupérer la liste des amis de l'utilisateur
export const getFriends = async () => {
	try {
		const response = await axios.get(API_URL + `/api/friends`, {
			headers: getTokenHeaders(),
		});
		console.log(response.data);
		return { success: true, data: response.data };
	} catch (error) {
		console.error("Error fetching friends:", error);
		return { success: false, message: error.message, data: [] };
	}
};

// Rechercher des amis par nom
export const searchFriends = async (query) => {
	try {
		const response = await axios.get(
			API_URL + `/api/friends/search?query=${encodeURIComponent(query)}`,
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error searching friends:", error);
		return { success: false, message: error.message, data: [] };
	}
};

// Récupérer les suggestions d'amis
export const getSuggestedFriends = async () => {
	try {
		const response = await axios.get(API_URL + `/api/friends/suggestions`, {
			headers: getTokenHeaders(),
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching friend suggestions:", error);
		return { success: false, message: error.message, data: [] };
	}
};

// Récupérer les demandes d'amitié reçues
export const getFriendRequests = async () => {
	try {
		const response = await axios.get(API_URL + `/api/friends/requests`, {
			headers: getTokenHeaders(),
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching friend requests:", error);
		return { success: false, message: error.message, data: [] };
	}
};

// Envoyer une demande d'amitié
export const sendFriendRequest = async (friendId) => {
	try {
		const response = await axios.post(
			API_URL + `/api/friends/request`,
			{ friendId },
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error sending friend request:", error);
		return { success: false, message: error.message };
	}
};

// Annuler une demande d'amitié
export const cancelFriendRequest = async (friendId) => {
	try {
		const response = await axios.delete(
			API_URL + `/api/friends/request/${friendId}`,
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error canceling friend request:", error);
		return { success: false, message: error.message };
	}
};

// Accepter une demande d'amitié
export const acceptFriendRequest = async (friendId) => {
	try {
		const response = await axios.post(
			API_URL + `/api/friends/accept`,
			{ friendId },
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error accepting friend request:", error);
		return { success: false, message: error.message };
	}
};

// Refuser une demande d'amitié
export const rejectFriendRequest = async (friendId) => {
	try {
		const response = await axios.post(
			API_URL + `/api/friends/reject`,
			{ friendId },
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error rejecting friend request:", error);
		return { success: false, message: error.message };
	}
};

// Supprimer un ami
export const removeFriend = async (friendId) => {
	try {
		const response = await axios.delete(
			API_URL + `/api/friends/d/${friendId}`,
			{
				headers: getTokenHeaders(),
			}
		);
		return response.data;
	} catch (error) {
		console.error("Error removing friend:", error);
		return { success: false, message: error.message };
	}
};

// Démarrer un chat avec un ami
export const startChat = async (friendId) => {
	try {
		const response = await axios.post(
			API_URL + `/api/chats/start`,
			{ friendId },
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error starting chat:", error);
		return { success: false, message: error.message };
	}
};

// Démarrer un appel avec un ami
export const startCall = async (friendId, isVideo = false) => {
	try {
		const response = await axios.post(
			API_URL + `/api/calls/start`,
			{ friendId, isVideo },
			{ headers: getTokenHeaders() }
		);
		return response.data;
	} catch (error) {
		console.error("Error starting call:", error);
		return { success: false, message: error.message };
	}
};
