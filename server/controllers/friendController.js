const friendService = require("../services/friendService");

// Obtenir des suggestions d'amis
exports.getSuggestedFriends = async (req, res) => {
	try {
		const userId = req.user.id;
		const suggestions = await friendService.getSuggestedFriends(userId);
		res.status(200).json(suggestions);
	} catch (error) {
		console.error("Erreur lors de l'obtention des suggestions d'amis:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Obtenir les demandes d'amitié
exports.getFriendRequests = async (req, res) => {
	try {
		const userId = req.user.id;
		const requests = await friendService.getFriendRequests(userId);
		res.status(200).json(requests);
	} catch (error) {
		console.error("Erreur lors de l'obtention des demandes d'amitié:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Envoyer une demande d'amitié
exports.sendFriendRequest = async (req, res) => {
	try {
		const { userId, targetUserIdBody } = getIds(req);
		await friendService.sendFriendRequest(userId, targetUserIdBody);
		res
			.status(200)
			.json({ success: true, message: "Demande d'amitié envoyée" });
	} catch (error) {
		console.error("Erreur lors de l'envoi de la demande d'amitié:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Annuler une demande d'amitié
exports.cancelFriendRequest = async (req, res) => {
	try {
		const { userId, targetUserId } = getIds(req);
		await friendService.cancelFriendRequest(userId, targetUserId);
		res
			.status(200)
			.json({ success: true, message: "Demande d'amitié annulée" });
	} catch (error) {
		console.error("Erreur lors de l'annulation de la demande d'amitié:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Accepter une demande d'amitié
exports.acceptFriendRequest = async (req, res) => {
	try {
		const { userId, targetUserIdBody } = getIds(req);
		await friendService.acceptFriendRequest(userId, targetUserIdBody);
		res
			.status(200)
			.json({ success: true, message: "Demande d'amitié acceptée" });
	} catch (error) {
		console.error(
			"Erreur lors de l'acceptation de la demande d'amitié:",
			error
		);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Rejeter une demande d'amitié
exports.rejectFriendRequest = async (req, res) => {
	try {
		const { userId, targetUserIdBody } = getIds(req);
		await friendService.rejectFriendRequest(userId, targetUserIdBody);
		res
			.status(200)
			.json({ success: true, message: "Demande d'amitié rejetée" });
	} catch (error) {
		console.error("Erreur lors du rejet de la demande d'amitié:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Supprimer un ami
exports.removeFriend = async (req, res) => {
	try {
		const { userId, targetUserId } = getIds(req);
		await friendService.removeFriend(userId, targetUserId);
		res.status(200).json({ success: true, message: "Ami supprimé" });
	} catch (error) {
		console.error("Erreur lors de la suppression de l'ami:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

// Obtenir la liste des amis
exports.getFriends = async (req, res) => {
	try {
		const userId = req.user.id;
		const friends = await friendService.getFriends(userId);
		res.status(200).json(friends);
	} catch (error) {
		console.error("Erreur lors de l'obtention des amis:", error);
		res.status(500).json({ message: error | "Erreur serveur" });
	}
};

const getIds = (req) => ({
	userId: req.user.id,
	targetUserIdParams: req.params.targetUserId,
	targetUserIdBody: req.body.friendId,
});
