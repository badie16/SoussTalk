const messageService = require('../services/messageService');

// Envoi d’un message
exports.sendMessage = async (req, res) => {
	const { senderId, receiverId, text } = req.body;
	try {
		const message = await messageService.createMessage({ senderId, receiverId, text });
		res.status(201).json(message);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Récupération des messages d’une conversation
exports.getMessages = async (req, res) => {
	const { conversationId } = req.params;
	try {
		const messages = await messageService.getMessagesByConversation(conversationId);
		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Liste des conversations de l'utilisateur
exports.getUserConversations = async (req, res) => {
	try {
		const conversations = await messageService.getUserConversations(req.user.id);
		res.json(conversations);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
	try {
		await messageService.deleteMessage(req.params.messageId);
		res.status(204).send();
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Modifier un message
exports.editMessage = async (req, res) => {
	try {
		const updated = await messageService.editMessage(req.params.messageId, req.body.text);
		res.json(updated);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Rechercher un message dans une conversation
exports.searchMessages = async (req, res) => {
	try {
		const result = await messageService.searchMessages(req.params.conversationId, req.query.q);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Ajouter une réaction
exports.addReaction = async (req, res) => {
	try {
		const reaction = await messageService.addReaction(req.params.messageId, req.user.id, req.body.emoji);
		res.status(201).json(reaction);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Marquer comme lu
exports.markAsRead = async (req, res) => {
	try {
		await messageService.markConversationAsRead(req.params.conversationId, req.user.id);
		res.status(204).send();
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Créer une conversation privée
exports.createPrivateConversation = async (req, res) => {
	try {
		const conversation = await messageService.createPrivateConversation(req.user.id, req.body.receiverId);
		res.status(201).json(conversation);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Créer un groupe
exports.createGroup = async (req, res) => {
	try {
		const group = await messageService.createGroup(req.user.id, req.body.name, req.body.members);
		res.status(201).json(group);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Ajouter un membre à un groupe
exports.addMemberToGroup = async (req, res) => {
	try {
		const updated = await messageService.addMemberToGroup(req.params.conversationId, req.body.userId);
		res.json(updated);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Retirer un membre d’un groupe
exports.removeMemberFromGroup = async (req, res) => {
	try {
		await messageService.removeMemberFromGroup(req.params.conversationId, req.params.userId);
		res.status(204).send();
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Obtenir les membres d’un groupe
exports.getConversationMembers = async (req, res) => {
	try {
		const members = await messageService.getConversationMembers(req.params.conversationId);
		res.json(members);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Modifier le nom d’un groupe
exports.updateGroupName = async (req, res) => {
	try {
		const group = await messageService.updateGroupName(req.params.conversationId, req.body.name);
		res.json(group);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Obtenir les amis de l'utilisateur
exports.getUserFriends = async (req, res) => {
	try {
		const friends = await messageService.getUserFriends(req.user.id);
		res.json(friends);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Servir un fichier joint
exports.serveFile = async (req, res) => {
	try {
		const filePath = await messageService.getFilePath(req.params.filename);
		res.sendFile(filePath);
	} catch (err) {
		res.status(404).json({ error: "Fichier introuvable" });
	}
};

// Gestion de l’upload (si applicable)
exports.uploadFile = (req, res, next) => {
	// Middleware vide ou multer + traitement à implémenter si nécessaire
	next();
};
