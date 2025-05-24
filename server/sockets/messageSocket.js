const messageService = require("../services/messageService");
const supabase = require("../config/supabase");

exports.setupMessageSocket = (socket, io) => {
	console.log(`User ${socket.user.id} connected to message socket`);

	// Rejoindre la room de l'utilisateur
	socket.join(`user_${socket.user.id}`);

	// Rejoindre les conversations de l'utilisateur
	socket.on("join_user_conversations", async () => {
		try {
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			conversations.forEach((conv) => {
				socket.join(`conversation_${conv.id}`);
			});
		} catch (error) {
			console.error("Error joining user conversations:", error);
		}
	});

	// Envoyer un message
	socket.on("send_message", async (data) => {
		try {
			const messageData = {
				senderId: socket.user.id,
				conversationId: data.conversationId,
				content: data.content,
				messageType: data.messageType || "text",
				replyToId: data.replyToId || null,
			};

			const savedMessage = await messageService.createMessage(messageData);

			// Obtenir les membres de la conversation
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);

			// Envoyer le message aux autres membres
			members.forEach((member) => {
				if (member.id !== socket.user.id) {
					io.to(`user_${member.id}`).emit("new_message", {
						...savedMessage,
						conversationId: data.conversationId,
					});
				}
			});

			// Confirmer l'envoi à l'expéditeur
			socket.emit("message_sent", {
				...savedMessage,
				conversationId: data.conversationId,
			});
		} catch (error) {
			console.error("Erreur send_message:", error);
			socket.emit("message_error", { error: error.message });
		}
	});

	// Marquer les messages comme lus
	socket.on("mark_messages_read", async (data) => {
		try {
			await messageService.markMessagesAsRead(
				data.conversationId,
				socket.user.id
			);

			// Notifier les autres participants
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				if (member.id !== socket.user.id) {
					io.to(`user_${member.id}`).emit("messages_read", {
						conversationId: data.conversationId,
						userId: socket.user.id,
					});
				}
			});
		} catch (error) {
			console.error("Erreur mark_messages_read:", error);
		}
	});

	// Indicateur de frappe
	socket.on("typing_start", async (data) => {
		try {
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				if (member.id !== socket.user.id) {
					io.to(`user_${member.id}`).emit("user_typing", {
						conversationId: data.conversationId,
						userId: socket.user.id,
						username: socket.user.username,
					});
				}
			});
		} catch (error) {
			console.error("Erreur typing_start:", error);
		}
	});

	socket.on("typing_stop", async (data) => {
		try {
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				if (member.id !== socket.user.id) {
					io.to(`user_${member.id}`).emit("user_stopped_typing", {
						conversationId: data.conversationId,
						userId: socket.user.id,
					});
				}
			});
		} catch (error) {
			console.error("Erreur typing_stop:", error);
		}
	});

	// Rejoindre une conversation
	socket.on("join_conversation", (conversationId) => {
		socket.join(`conversation_${conversationId}`);
		console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
	});

	// Quitter une conversation
	socket.on("leave_conversation", (conversationId) => {
		socket.leave(`conversation_${conversationId}`);
		console.log(`User ${socket.user.id} left conversation ${conversationId}`);
	});

	// Réaction à un message
	socket.on("add_reaction", async (data) => {
		try {
			const result = await messageService.addReaction(
				data.messageId,
				socket.user.id,
				data.emoji
			);

			// Diffuser la réaction à tous les participants de la conversation
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				io.to(`user_${member.id}`).emit("message_reaction", {
					messageId: data.messageId,
					userId: socket.user.id,
					emoji: data.emoji,
					action: result.action,
					conversationId: data.conversationId,
				});
			});
		} catch (error) {
			console.error("Erreur add_reaction:", error);
			socket.emit("reaction_error", { error: error.message });
		}
	});

	// Suppression de message
	socket.on("delete_message", async (data) => {
		try {
			await messageService.deleteMessage(data.messageId, socket.user.id);

			// Notifier tous les participants
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				io.to(`user_${member.id}`).emit("message_deleted", {
					messageId: data.messageId,
					conversationId: data.conversationId,
				});
			});
		} catch (error) {
			console.error("Erreur delete_message:", error);
			socket.emit("delete_error", { error: error.message });
		}
	});

	// Modification de message
	socket.on("edit_message", async (data) => {
		try {
			const editedMessage = await messageService.editMessage(
				data.messageId,
				socket.user.id,
				data.content
			);

			// Notifier tous les participants
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);
			members.forEach((member) => {
				io.to(`user_${member.id}`).emit("message_edited", editedMessage);
			});
		} catch (error) {
			console.error("Erreur edit_message:", error);
			socket.emit("edit_error", { error: error.message });
		}
	});

	// Mise à jour du statut en ligne
	socket.on("update_online_status", async (isOnline) => {
		try {
			// Mettre à jour le statut dans la base de données
			const { error } = await supabase
				.from("users")
				.update({
					is_online: isOnline,
					last_seen: new Date().toISOString(),
				})
				.eq("id", socket.user.id);

			if (error) throw error;

			// Notifier les contacts de l'utilisateur
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			const contactIds = new Set();

			conversations.forEach((conv) => {
				if (!conv.isGroup) {
					contactIds.add(conv.userId);
				} else {
					conv.members.forEach((member) => contactIds.add(member.id));
				}
			});

			contactIds.forEach((contactId) => {
				io.to(`user_${contactId}`).emit("user_status_changed", {
					userId: socket.user.id,
					isOnline,
					lastSeen: new Date().toISOString(),
				});
			});
		} catch (error) {
			console.error("Error updating online status:", error);
		}
	});

	// Gestion de la déconnexion
	socket.on("disconnect", async () => {
		console.log(`User ${socket.user.id} disconnected`);

		try {
			// Marquer l'utilisateur comme hors ligne
			const { error } = await supabase
				.from("users")
				.update({
					is_online: false,
					last_seen: new Date().toISOString(),
				})
				.eq("id", socket.user.id);

			if (error) throw error;

			// Notifier les contacts
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			const contactIds = new Set();

			conversations.forEach((conv) => {
				if (!conv.isGroup) {
					contactIds.add(conv.userId);
				} else {
					conv.members.forEach((member) => contactIds.add(member.id));
				}
			});

			contactIds.forEach((contactId) => {
				io.to(`user_${contactId}`).emit("user_status_changed", {
					userId: socket.user.id,
					isOnline: false,
					lastSeen: new Date().toISOString(),
				});
			});
		} catch (error) {
			console.error("Error handling disconnect:", error);
		}
	});
};
