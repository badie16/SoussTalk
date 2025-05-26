const messageService = require("../services/messageService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const supabase = require("../config/supabase");

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
exports.sendMessage = async (req, res) => {
	try {
		const {
			conversationId,
			content,
			messageType = "text",
			replyToId,
		} = req.body;
		const senderId = req.user.id;

		// Validation
		if (!conversationId) {
			return res.status(400).json({ error: "Conversation ID is required" });
		}

		if (!content && !req.file) {
			return res
				.status(400)
				.json({ error: "Message content or file is required" });
		}

		let fileUrl = null;
		let fileName = null;
		let finalMessageType = messageType;

		if (req.file) {
			const localPath = path.join(
				__dirname,
				"..",
				"uploads",
				req.file.filename
			);

			const supabasePath = `messages/${Date.now()}_${req.file.originalname}`;

			// Lire le fichier depuis le système local
			const fileBuffer = fs.readFileSync(localPath);

			// Uploader sur Supabase Storage
			const { error: uploadError } = await supabase.storage
				.from("chat-files") // nom du bucket
				.upload(supabasePath, fileBuffer, {
					contentType: req.file.mimetype,
					upsert: true,
				});

			if (uploadError) {
				throw new Error("File upload failed: " + uploadError.message);
			}

			// Générer l’URL publique
			const { data } = supabase.storage
				.from("chat-files")
				.getPublicUrl(supabasePath);

			fileUrl = data.publicUrl;
			fileName = req.file.originalname;
			finalMessageType = getFileType(req.file.mimetype);

			// Facultatif : supprimer le fichier local une fois uploadé
			fs.unlinkSync(localPath);
		}

		const message = await messageService.createMessage({
			senderId,
			conversationId,
			content: content || "",
			messageType: finalMessageType,
			fileUrl,
			fileName,
			replyToId: replyToId || null,
		});

		// Obtenir les membres de la conversation pour les notifications
		const members = await messageService.getConversationMembers(
			conversationId,
			senderId
		);

		// Émettre le message à tous les membres sauf l'expéditeur
		members.forEach((member) => {
			if (member.id !== senderId) {
				req.io.to(`user_${member.id}`).emit("new_message", {
					...message,
					conversationId,
				});
			}
		});

		// Confirmer l'envoi à l'expéditeur
		req.io.to(`user_${senderId}`).emit("message_sent", {
			...message,
			conversationId,
		});

		res.status(201).json(message);
	} catch (error) {
		console.error("Send message error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.getMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { limit = 50, offset = 0 } = req.query;
		const userId = req.user.id;

		const messages = await messageService.getMessagesByConversation(
			conversationId,
			userId,
			Number.parseInt(limit),
			Number.parseInt(offset)
		);

		res.json(messages);
	} catch (error) {
		console.error("Get messages error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.createPrivateConversation = async (req, res) => {
	try {
		const { userId } = req.body;
		const currentUserId = req.user.id;

		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		if (userId === currentUserId) {
			return res
				.status(400)
				.json({ error: "Cannot create conversation with yourself" });
		}

		// Vérifier si l'utilisateur existe
		const { data: targetUser, error: userError } = await supabase
			.from("users")
			.select("id, username, first_name, last_name, avatar_url")
			.eq("id", userId)
			.single();

		if (userError || !targetUser) {
			return res.status(404).json({ error: "User not found" });
		}

		const conversation = await messageService.createPrivateConversation(
			currentUserId,
			userId
		);

		// Notifier l'autre utilisateur avec les détails complets de la conversation
		const conversationForOtherUser = {
			id: conversation.id,
			name: messageService.formatUserName(req.user),
			isGroup: false,
			avatar: req.user.avatar_url,
			online: true,
			userId: req.user.id,
			lastMessage: null,
			unreadCount: 0,
		};
		req.io
			.to(`user_${userId}`)
			.emit("new_conversation", conversationForOtherUser);

		res.json({
			...conversation,
			otherUser: targetUser,
		});
	} catch (error) {
		console.error("Create private conversation error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.createGroup = async (req, res) => {
	try {
		const { name, memberIds = [] } = req.body;
		const creatorId = req.user.id;

		if (!name || name.trim().length === 0) {
			return res.status(400).json({ error: "Group name is required" });
		}

		if (memberIds.length === 0) {
			return res.status(400).json({ error: "At least one member is required" });
		}

		// Vérifier que tous les membres existent
		const { data: users, error: usersError } = await supabase
			.from("users")
			.select("id, username, first_name, last_name")
			.in("id", memberIds);

		if (usersError) {
			return res.status(500).json({ error: "Error validating users" });
		}

		if (users.length !== memberIds.length) {
			return res.status(400).json({ error: "Some users not found" });
		}

		const group = await messageService.createGroupConversation(
			creatorId,
			name.trim(),
			memberIds
		);

		// Notifier tous les membres du nouveau groupe
		const allMemberIds = [creatorId, ...memberIds];
		allMemberIds.forEach((memberId) => {
			req.io.to(`user_${memberId}`).emit("new_group", {
				...group,
				createdBy: req.user,
				members: users,
			});
		});

		res.status(201).json(group);
	} catch (error) {
		console.error("Create group error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.getUserConversations = async (req, res) => {
	try {
		const userId = req.user.id;
		const conversations = await messageService.getUserConversations(userId);

		// Ajouter le nombre de messages non lus pour chaque conversation
		const conversationsWithUnread = await Promise.all(
			conversations.map(async (conv) => {
				const unreadCount = await messageService.getUnreadCount(
					conv.id,
					userId
				);
				return { ...conv, unreadCount };
			})
		);

		res.json(conversationsWithUnread);
	} catch (error) {
		console.error("Get user conversations error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.getUserFriends = async (req, res) => {
	try {
		const userId = req.user.id;
		const friends = await messageService.getUserFriends(userId);
		res.json(friends);
	} catch (error) {
		console.error("Get user friends error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.addMemberToGroup = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { userId } = req.body;
		const addedBy = req.user.id;

		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		const result = await messageService.addMemberToGroup(
			conversationId,
			userId,
			addedBy
		);

		// Notifier tous les membres du groupe
		const members = await messageService.getConversationMembers(
			conversationId,
			addedBy
		);
		members.forEach((member) => {
			req.io.to(`user_${member.id}`).emit("member_added", {
				conversationId,
				newMember: result.user,
				addedBy,
			});
		});

		// Notifier le nouveau membre
		req.io.to(`user_${userId}`).emit("added_to_group", {
			conversationId,
			addedBy,
		});

		res.json(result);
	} catch (error) {
		console.error("Add member to group error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.removeMemberFromGroup = async (req, res) => {
	try {
		const { conversationId, userId } = req.params;
		const removedBy = req.user.id;

		await messageService.removeMemberFromGroup(
			conversationId,
			userId,
			removedBy
		);

		// Notifier tous les membres du groupe
		const members = await messageService.getConversationMembers(
			conversationId,
			removedBy
		);
		members.forEach((member) => {
			req.io.to(`user_${member.id}`).emit("member_removed", {
				conversationId,
				removedUserId: userId,
				removedBy,
			});
		});

		// Notifier l'utilisateur supprimé
		req.io.to(`user_${userId}`).emit("removed_from_group", {
			conversationId,
			removedBy,
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Remove member from group error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.getConversationMembers = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user.id;

		const members = await messageService.getConversationMembers(
			conversationId,
			userId
		);
		res.json(members);
	} catch (error) {
		console.error("Get conversation members error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.updateGroupName = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { name } = req.body;
		const updatedBy = req.user.id;

		if (!name || name.trim().length === 0) {
			return res.status(400).json({ error: "Group name is required" });
		}

		const updatedGroup = await messageService.updateGroupName(
			conversationId,
			name.trim(),
			updatedBy
		);

		// Notifier tous les membres du groupe
		const members = await messageService.getConversationMembers(
			conversationId,
			updatedBy
		);
		members.forEach((member) => {
			req.io.to(`user_${member.id}`).emit("group_name_updated", {
				conversationId,
				newName: name.trim(),
				updatedBy,
			});
		});

		res.json(updatedGroup);
	} catch (error) {
		console.error("Update group name error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user.id;

		const deletedMessage = await messageService.deleteMessage(
			messageId,
			userId
		);

		// Émettre la suppression via Socket.io
		const members = await messageService.getConversationMembers(
			deletedMessage.conversation_id,
			userId
		);
		members.forEach((member) => {
			req.io.to(`user_${member.id}`).emit("message_deleted", {
				messageId,
				conversationId: deletedMessage.conversation_id,
			});
		});

		res.json({ success: true, message: "Message deleted successfully" });
	} catch (error) {
		console.error("Delete message error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.editMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { content } = req.body;
		const userId = req.user.id;

		if (!content || content.trim().length === 0) {
			return res.status(400).json({ error: "Message content is required" });
		}

		const editedMessage = await messageService.editMessage(
			messageId,
			userId,
			content.trim()
		);

		// Émettre la modification via Socket.io
		const members = await messageService.getConversationMembers(
			editedMessage.conversation_id,
			userId
		);
		members.forEach((member) => {
			req.io.to(`user_${member.id}`).emit("message_edited", editedMessage);
		});

		res.json(editedMessage);
	} catch (error) {
		console.error("Edit message error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.addReaction = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { emoji } = req.body;
		const userId = req.user.id;
		console.log(emoji);

		if (!emoji) {
			return res.status(400).json({ error: "Emoji is required" });
		}
		const result = await messageService.addOrUpdateReaction(
			messageId,
			userId,
			emoji
		);

		// Émettre la réaction via Socket.io
		// Obtenir la conversation pour notifier les membres
		const { data: message } = await supabase
			.from("messages")
			.select("conversation_id")
			.eq("id", messageId)
			.single();

		if (message) {
			const members = await messageService.getConversationMembers(
				message.conversation_id,
				userId
			);
			members.forEach((member) => {
				req.io.to(`user_${member.id}`).emit("message_reaction", {
					messageId,
					userId,
					emoji,
					action: result.action,
					conversationId: message.conversation_id,
				});
			});
		}

		res.json(result);
	} catch (error) {
		console.error("Add reaction error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.markAsRead = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user.id;

		await messageService.markMessagesAsRead(conversationId, userId);

		// Émettre la lecture via Socket.io
		const members = await messageService.getConversationMembers(
			conversationId,
			userId
		);
		members.forEach((member) => {
			if (member.id !== userId) {
				req.io.to(`user_${member.id}`).emit("messages_read", {
					conversationId,
					userId,
				});
			}
		});

		res.json({ success: true });
	} catch (error) {
		console.error("Mark as read error:", error);
		res.status(500).json({ error: error.message });
	}
};

exports.searchMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { q: query } = req.query;
		const userId = req.user.id;

		if (!query || query.trim().length < 2) {
			return res
				.status(400)
				.json({ error: "Query must be at least 2 characters long" });
		}

		const messages = await messageService.searchMessages(
			conversationId,
			userId,
			query.trim()
		);
		res.json(messages);
	} catch (error) {
		console.error("Search messages error:", error);
		res.status(500).json({ error: error.message });
	}
};

// Fonction utilitaire pour déterminer le type de fichier
function getFileType(mimetype) {
	if (mimetype.startsWith("image/")) return "image";
	if (mimetype.startsWith("video/")) return "video";
	if (mimetype.startsWith("audio/")) return "audio";
	return "file";
}

// Servir les fichiers uploadés
exports.serveFile = (req, res) => {
	const { filename } = req.params;
	const filePath = path.join(__dirname, "../../uploads", filename);

	if (fs.existsSync(filePath)) {
		res.sendFile(path.resolve(filePath));
	} else {
		res.status(404).json({ error: "File not found" });
	}
};
