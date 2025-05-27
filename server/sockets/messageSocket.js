const messageService = require("../services/messageService");
const supabase = require("../config/supabase");

exports.setupMessageSocket = (socket, io) => {
	// Rejoindre la room de l'utilisateur
	socket.join(`user_${socket.user.id}`);

	// Rejoindre automatiquement toutes les conversations de l'utilisateur
	socket.on("join_user_conversations", async () => {
		try {
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			conversations.forEach((conv) => {
				socket.join(`conversation_${conv.id}`);
			});

			// Notifier que l'utilisateur est en ligne
			socket.broadcast.emit("user_status_changed", {
				userId: socket.user.id,
				isOnline: true,
				lastSeen: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Error joining user conversations:", error);
		}
	});

	// Rejoindre une conversation spécifique
	socket.on("join_conversation", (conversationId) => {
		socket.join(`conversation_${conversationId}`);
		console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
	});

	// Quitter une conversation
	socket.on("leave_conversation", (conversationId) => {
		socket.leave(`conversation_${conversationId}`);
		console.log(`User ${socket.user.id} left conversation ${conversationId}`);
	});

	// Envoyer un message avec notification améliorée
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

			// Enrichir le message avec les infos du sender
			const enrichedMessage = {
				...savedMessage,
				conversationId: data.conversationId,
				sender: {
					id: socket.user.id,
					username: socket.user.username,
					name: socket.user.first_name || socket.user.username,
				},
			};

			// Obtenir les membres de la conversation
			const members = await messageService.getConversationMembers(
				data.conversationId,
				socket.user.id
			);

			// Envoyer le message aux autres membres
			members.forEach((member) => {
				if (member.id !== socket.user.id) {
					io.to(`user_${member.id}`).emit("new_message", enrichedMessage);
				}
			});

			// Confirmer l'envoi à l'expéditeur
			socket.emit("message_sent", enrichedMessage);

			// Mettre à jour la liste des conversations pour tous
			io.to(`conversation_${data.conversationId}`).emit(
				"conversation_updated",
				{
					conversationId: data.conversationId,
					lastMessage: {
						content: savedMessage.content,
						timestamp: savedMessage.created_at,
						senderName: socket.user.username,
						messageType: savedMessage.message_type,
					},
				}
			);
		} catch (error) {
			console.error("Erreur send_message:", error);
			socket.emit("message_error", { error: error.message });
		}
	});

	// Indicateur de frappe amélioré
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

	// Marquer les messages comme lus avec notification
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

	// Réaction à un message avec mise à jour temps réel
	socket.on("add_reaction", async (data) => {
		try {
			const result = await messageService.addOrUpdateReaction(
				data.messageId,
				socket.user.id,
				data.emoji
			);

			// Obtenir la conversation pour notifier les membres
			const { data: message } = await supabase
				.from("messages")
				.select("conversation_id")
				.eq("id", data.messageId)
				.single();

			if (message) {
				const members = await messageService.getConversationMembers(
					message.conversation_id,
					socket.user.id
				);

				// Diffuser la réaction à tous les participants
				members.forEach((member) => {
					io.to(`user_${member.id}`).emit("message_reaction", {
						messageId: data.messageId,
						userId: socket.user.id,
						emoji: data.emoji,
						action: result.action,
						conversationId: message.conversation_id,
					});
				});
			}
		} catch (error) {
			console.error("Erreur add_reaction:", error);
			socket.emit("reaction_error", { error: error.message });
		}
	});

	// Suppression de message avec notification
	socket.on("delete_message", async (data) => {
		try {
			const deletedMessage = await messageService.deleteMessage(
				data.messageId,
				socket.user.id
			);

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

	// Modification de message avec notification
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

	// Mise à jour du statut en ligne améliorée
	socket.on("update_online_status", async (isOnline) => {
		try {
			const { error } = await supabase
				.from("users")
				.update({
					is_online: isOnline,
					last_seen: new Date().toISOString(),
				})
				.eq("id", socket.user.id);

			if (error) throw error;

			// Notifier tous les contacts
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			const contactIds = new Set();

			conversations.forEach((conv) => {
				if (!conv.isGroup && conv.userId) {
					contactIds.add(conv.userId);
				} else if (conv.isGroup && conv.members) {
					conv.members.forEach((member) => {
						if (member.id !== socket.user.id) {
							contactIds.add(member.id);
						}
					});
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

	// Gestion de la déconnexion améliorée
	socket.on("disconnect", async () => {
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

			// Notifier tous les contacts
			const conversations = await messageService.getUserConversations(
				socket.user.id
			);
			const contactIds = new Set();

			conversations.forEach((conv) => {
				if (!conv.isGroup && conv.userId) {
					contactIds.add(conv.userId);
				} else if (conv.isGroup && conv.members) {
					conv.members.forEach((member) => {
						if (member.id !== socket.user.id) {
							contactIds.add(member.id);
						}
					});
				}
			});

			contactIds.forEach((contactId) => {
				io.to(`user_${contactId}`).emit("user_status_changed", {
					userId: socket.user.id,
					isOnline: false,
					lastSeen: new Date().toISOString(),
				});
			});

			console.log(`User ${socket.user.id} disconnected`);
		} catch (error) {
			console.error("Error handling disconnect:", error);
		}
	});
};
