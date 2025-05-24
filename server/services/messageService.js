const supabase = require("../config/supabase");

exports.createMessage = async ({
	senderId,
	conversationId,
	content,
	messageType = "text",
	fileUrl = null,
	fileName = null,
	replyToId = null,
}) => {
	try {
		// Vérifier que l'utilisateur est membre de la conversation
		const { data: membership } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", senderId)
			.single();

		if (!membership) {
			throw new Error("User is not a member of this conversation");
		}

		const { data, error } = await supabase.from("messages").insert([
			{
				sender_id: senderId,
				conversation_id: conversationId,
				content: content,
				message_type: messageType,
				file_url: fileUrl,
				file_name: fileName,
				reply_to_id: replyToId,
				created_at: new Date().toISOString(),
			},
		]).select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, avatar_url, first_name, last_name)
      `);

		if (error) throw new Error(error.message);

		// Mettre à jour la dernière activité de la conversation
		await this.updateConversationLastActivity(conversationId, data[0].id);

		return data[0];
	} catch (error) {
		throw new Error(`Error creating message: ${error.message}`);
	}
};

exports.getMessagesByConversation = async (
	conversationId,
	userId,
	limit = 50,
	offset = 0
) => {
	try {
		// Vérifier que l'utilisateur est membre de la conversation
		const { data: membership } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", userId)
			.single();

		if (!membership) {
			throw new Error("User is not a member of this conversation");
		}

		// Requête simplifiée pour éviter les erreurs de relation
		const { data, error } = await supabase
			.from("messages")
			.select(
				`
        *,
        sender:users!messages_sender_id_fkey(id, username, avatar_url, first_name, last_name)
      `
			)
			.eq("conversation_id", conversationId)
			.is("deleted_at", null)
			.order("created_at", { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) throw new Error(error.message);

		// Récupérer les réactions séparément
		const messageIds = data.map((msg) => msg.id);
		let reactions = [];

		if (messageIds.length > 0) {
			const { data: reactionsData } = await supabase
				.from("message_reactions")
				.select(
					`
          id, emoji, created_at, message_id,
          user:users!message_reactions_user_id_fkey(id, username, first_name, last_name)
        `
				)
				.in("message_id", messageIds);

			reactions = reactionsData || [];
		}

		// Associer les réactions aux messages
		const messagesWithReactions = data.map((message) => ({
			...message,
			reactions: reactions.filter(
				(reaction) => reaction.message_id === message.id
			),
		}));

		return messagesWithReactions;
	} catch (error) {
		throw new Error(`Error fetching messages: ${error.message}`);
	}
};

exports.createPrivateConversation = async (userId1, userId2) => {
	try {
		if (userId1 === userId2) {
			throw new Error("Cannot create conversation with yourself");
		}

		// Vérifier si une conversation existe déjà
		const existingConversation = await this.findPrivateConversation(
			userId1,
			userId2
		);
		if (existingConversation) {
			return existingConversation;
		}

		// Créer une nouvelle conversation
		const { data: conversation, error: convError } = await supabase
			.from("conversations")
			.insert([
				{
					is_group: false,
					name: null,
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();

		if (convError) throw new Error(convError.message);

		// Ajouter les membres
		const { error: membersError } = await supabase
			.from("conversation_members")
			.insert([
				{
					conversation_id: conversation.id,
					user_id: userId1,
					role: "member",
					joined_at: new Date().toISOString(),
				},
				{
					conversation_id: conversation.id,
					user_id: userId2,
					role: "member",
					joined_at: new Date().toISOString(),
				},
			]);

		if (membersError) throw new Error(membersError.message);

		return conversation;
	} catch (error) {
		throw new Error(`Error creating private conversation: ${error.message}`);
	}
};

exports.findPrivateConversation = async (userId1, userId2) => {
	try {
		// Requête simplifiée pour trouver une conversation privée
		const { data: conversations, error } = await supabase
			.from("conversations")
			.select(
				`
        *,
        conversation_members!inner(user_id)
      `
			)
			.eq("is_group", false);

		if (error) throw new Error(error.message);

		// Trouver la conversation qui a exactement ces deux utilisateurs
		for (const conversation of conversations) {
			const memberIds = conversation.conversation_members.map((m) => m.user_id);
			if (
				memberIds.length === 2 &&
				memberIds.includes(userId1) &&
				memberIds.includes(userId2)
			) {
				return conversation;
			}
		}

		return null;
	} catch (error) {
		console.error("Error finding private conversation:", error);
		return null;
	}
};

exports.getUserConversations = async (userId) => {
	try {
		// Récupérer les conversations de l'utilisateur
		const { data: membershipData, error: membershipError } = await supabase
			.from("conversation_members")
			.select(
				`
        conversation_id,
        joined_at,
        role,
        conversation:conversations!inner(*)
      `
			)
			.eq("user_id", userId)
			.order("joined_at", { ascending: false });

		if (membershipError) throw new Error(membershipError.message);

		const conversations = [];

		for (const membership of membershipData) {
			const conv = membership.conversation;

			// Récupérer tous les membres de cette conversation
			const { data: allMembers } = await supabase
				.from("conversation_members")
				.select(
					`
          user_id, role, joined_at,
          user:users(id, username, avatar_url, first_name, last_name, is_online, last_seen)
        `
				)
				.eq("conversation_id", conv.id);

			// Récupérer le dernier message
			const { data: lastMessageData } = await supabase
				.from("messages")
				.select(
					`
          content, created_at, message_type, sender_id,
          sender:users!messages_sender_id_fkey(username, first_name, last_name)
        `
				)
				.eq("conversation_id", conv.id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false })
				.limit(1);

			const lastMessage = lastMessageData?.[0];
			const members = allMembers?.filter((m) => m.user_id !== userId) || [];

			if (conv.is_group) {
				conversations.push({
					id: conv.id,
					name: conv.name,
					isGroup: true,
					members: members.map((m) => m.user),
					memberCount: allMembers?.length || 0,
					userRole: membership.role,
					createdBy: conv.created_by,
					lastMessage: lastMessage
						? {
								content: this.formatMessagePreview(lastMessage),
								timestamp: lastMessage.created_at,
								senderName: this.formatSenderName(lastMessage.sender),
								isOwn: lastMessage.sender_id === userId,
						  }
						: null,
					avatar: null,
					online: false,
					unreadCount: 0,
				});
			} else {
				const otherUser = members[0]?.user;
				conversations.push({
					id: conv.id,
					name: otherUser ? this.formatUserName(otherUser) : "Unknown User",
					isGroup: false,
					avatar: otherUser?.avatar_url,
					online: otherUser?.is_online || false,
					lastSeen: otherUser?.last_seen,
					userId: otherUser?.id,
					lastMessage: lastMessage
						? {
								content: this.formatMessagePreview(lastMessage),
								timestamp: lastMessage.created_at,
								senderName: this.formatSenderName(lastMessage.sender),
								isOwn: lastMessage.sender_id === userId,
						  }
						: null,
					unreadCount: 0,
				});
			}
		}

		return conversations.sort((a, b) => {
			const aTime = a.lastMessage?.timestamp || a.createdAt || 0;
			const bTime = b.lastMessage?.timestamp || b.createdAt || 0;
			return new Date(bTime) - new Date(aTime);
		});
	} catch (error) {
		throw new Error(`Error fetching user conversations: ${error.message}`);
	}
};

exports.getConversationMembers = async (conversationId, userId) => {
	try {
		// Vérifier que l'utilisateur est membre
		const { data: membership } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", userId)
			.single();

		if (!membership) {
			throw new Error("User is not a member of this conversation");
		}

		const { data, error } = await supabase
			.from("conversation_members")
			.select(
				`
        *,
        user:users(id, username, avatar_url, first_name, last_name, is_online, last_seen)
      `
			)
			.eq("conversation_id", conversationId)
			.order("joined_at", { ascending: true });

		if (error) throw new Error(error.message);

		return data.map((member) => ({
			...member.user,
			role: member.role,
			joinedAt: member.joined_at,
		}));
	} catch (error) {
		throw new Error(`Error fetching conversation members: ${error.message}`);
	}
};

exports.createGroupConversation = async (
	creatorId,
	groupName,
	memberIds = []
) => {
	try {
		if (!groupName || groupName.trim().length === 0) {
			throw new Error("Group name is required");
		}

		if (memberIds.length === 0) {
			throw new Error("At least one member is required");
		}

		// Créer la conversation de groupe
		const { data: conversation, error: convError } = await supabase
			.from("conversations")
			.insert([
				{
					is_group: true,
					name: groupName.trim(),
					created_by: creatorId,
					created_at: new Date().toISOString(),
				},
			])
			.select()
			.single();

		if (convError) throw new Error(convError.message);

		// Ajouter le créateur et les membres
		const allMemberIds = [
			creatorId,
			...memberIds.filter((id) => id !== creatorId),
		];
		const members = allMemberIds.map((userId, index) => ({
			conversation_id: conversation.id,
			user_id: userId,
			role: index === 0 ? "admin" : "member",
			joined_at: new Date().toISOString(),
		}));

		const { error: membersError } = await supabase
			.from("conversation_members")
			.insert(members);

		if (membersError) throw new Error(membersError.message);

		return conversation;
	} catch (error) {
		throw new Error(`Error creating group conversation: ${error.message}`);
	}
};

exports.addMemberToGroup = async (conversationId, userId, addedBy) => {
	try {
		// Vérifier que c'est bien un groupe
		const { data: conversation } = await supabase
			.from("conversations")
			.select("is_group")
			.eq("id", conversationId)
			.single();

		if (!conversation?.is_group) {
			throw new Error("Cannot add members to private conversations");
		}

		// Vérifier les permissions de l'utilisateur qui ajoute
		const { data: adderMembership } = await supabase
			.from("conversation_members")
			.select("role")
			.eq("conversation_id", conversationId)
			.eq("user_id", addedBy)
			.single();

		if (!adderMembership || adderMembership.role !== "admin") {
			throw new Error("Only admins can add members");
		}

		// Vérifier que l'utilisateur n'est pas déjà membre
		const { data: existingMember } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", userId)
			.single();

		if (existingMember) {
			throw new Error("User is already a member of this group");
		}

		// Ajouter le membre
		const { data, error } = await supabase.from("conversation_members").insert([
			{
				conversation_id: conversationId,
				user_id: userId,
				role: "member",
				joined_at: new Date().toISOString(),
			},
		]).select(`
        *,
        user:users(id, username, avatar_url, first_name, last_name)
      `);

		if (error) throw new Error(error.message);

		return data[0];
	} catch (error) {
		throw new Error(`Error adding member to group: ${error.message}`);
	}
};

exports.removeMemberFromGroup = async (conversationId, userId, removedBy) => {
	try {
		// Vérifier les permissions
		const { data: removerMembership } = await supabase
			.from("conversation_members")
			.select("role")
			.eq("conversation_id", conversationId)
			.eq("user_id", removedBy)
			.single();

		if (
			!removerMembership ||
			(removerMembership.role !== "admin" && removedBy !== userId)
		) {
			throw new Error("Insufficient permissions");
		}

		const { error } = await supabase
			.from("conversation_members")
			.delete()
			.eq("conversation_id", conversationId)
			.eq("user_id", userId);

		if (error) throw new Error(error.message);

		return { success: true };
	} catch (error) {
		throw new Error(`Error removing member from group: ${error.message}`);
	}
};

exports.updateConversationLastActivity = async (
	conversationId,
	lastMessageId
) => {
	try {
		const { error } = await supabase
			.from("conversations")
			.update({
				last_activity: new Date().toISOString(),
				last_message_id: lastMessageId,
			})
			.eq("id", conversationId);

		if (error) throw new Error(error.message);
	} catch (error) {
		throw new Error(`Error updating conversation: ${error.message}`);
	}
};

exports.deleteMessage = async (messageId, userId) => {
	try {
		// Vérifier que l'utilisateur peut supprimer ce message
		const { data: message } = await supabase
			.from("messages")
			.select("sender_id, conversation_id")
			.eq("id", messageId)
			.single();

		if (!message) {
			throw new Error("Message not found");
		}

		if (message.sender_id !== userId) {
			// Vérifier si l'utilisateur est admin du groupe
			const { data: membership } = await supabase
				.from("conversation_members")
				.select("role")
				.eq("conversation_id", message.conversation_id)
				.eq("user_id", userId)
				.single();

			if (!membership || membership.role !== "admin") {
				throw new Error("Insufficient permissions");
			}
		}

		const { data, error } = await supabase
			.from("messages")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", messageId)
			.select();

		if (error) throw new Error(error.message);
		return data[0];
	} catch (error) {
		throw new Error(`Error deleting message: ${error.message}`);
	}
};

exports.editMessage = async (messageId, userId, newContent) => {
	try {
		const { data, error } = await supabase
			.from("messages")
			.update({
				content: newContent,
				edited_at: new Date().toISOString(),
			})
			.eq("id", messageId)
			.eq("sender_id", userId)
			.is("deleted_at", null).select(`
        *,
        sender:users!messages_sender_id_fkey(id, username, avatar_url, first_name, last_name)
      `);

		if (error) throw new Error(error.message);
		if (!data || data.length === 0) {
			throw new Error("Message not found or cannot be edited");
		}

		return data[0];
	} catch (error) {
		throw new Error(`Error editing message: ${error.message}`);
	}
};

exports.addReaction = async (messageId, userId, emoji) => {
	try {
		// Vérifier si la réaction existe déjà
		const { data: existingReaction } = await supabase
			.from("message_reactions")
			.select("*")
			.eq("message_id", messageId)
			.eq("user_id", userId)
			.eq("emoji", emoji)
			.single();

		if (existingReaction) {
			// Supprimer la réaction si elle existe déjà
			const { error } = await supabase
				.from("message_reactions")
				.delete()
				.eq("id", existingReaction.id);

			if (error) throw new Error(error.message);
			return { action: "removed", messageId, emoji, userId };
		} else {
			// Ajouter la nouvelle réaction
			const { data, error } = await supabase.from("message_reactions").insert([
				{
					message_id: messageId,
					user_id: userId,
					emoji: emoji,
					created_at: new Date().toISOString(),
				},
			]).select(`
          *,
          user:users(id, username, first_name, last_name)
        `);

			if (error) throw new Error(error.message);
			return { action: "added", reaction: data[0] };
		}
	} catch (error) {
		throw new Error(`Error managing reaction: ${error.message}`);
	}
};

exports.markMessagesAsRead = async (conversationId, userId) => {
	try {
		const { error } = await supabase
			.from("messages")
			.update({ read_at: new Date().toISOString() })
			.eq("conversation_id", conversationId)
			.neq("sender_id", userId)
			.is("read_at", null)
			.is("deleted_at", null);

		if (error) throw new Error(error.message);
	} catch (error) {
		throw new Error(`Error marking messages as read: ${error.message}`);
	}
};

exports.searchMessages = async (conversationId, userId, query) => {
	try {
		// Vérifier que l'utilisateur est membre
		const { data: membership } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", userId)
			.single();

		if (!membership) {
			throw new Error("User is not a member of this conversation");
		}

		const { data, error } = await supabase
			.from("messages")
			.select(
				`
        *,
        sender:users!messages_sender_id_fkey(id, username, avatar_url, first_name, last_name)
      `
			)
			.eq("conversation_id", conversationId)
			.ilike("content", `%${query}%`)
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(50);

		if (error) throw new Error(error.message);
		return data;
	} catch (error) {
		throw new Error(`Error searching messages: ${error.message}`);
	}
};

// Nouvelle fonction pour obtenir les amis d'un utilisateur
exports.getUserFriends = async (userId) => {
	try {
		const { data, error } = await supabase
			.from("friendships")
			.select(
				`
        user1_id,
        user2_id,
        user1:users!friendships_user1_id_fkey(id, username, avatar_url, first_name, last_name, is_online),
        user2:users!friendships_user2_id_fkey(id, username, avatar_url, first_name, last_name, is_online)
      `
			)
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

		if (error) throw new Error(error.message);

		const friends = data.map((friendship) => {
			const friend =
				friendship.user1_id === userId ? friendship.user2 : friendship.user1;
			return {
				...friend,
				name: this.formatUserName(friend),
			};
		});

		return friends;
	} catch (error) {
		throw new Error(`Error fetching user friends: ${error.message}`);
	}
};

// Fonctions utilitaires
exports.formatUserName = (user) => {
	if (user.first_name || user.last_name) {
		return `${user.first_name || ""} ${user.last_name || ""}`.trim();
	}
	return user.username;
};

exports.formatSenderName = (sender) => {
	if (sender.first_name || sender.last_name) {
		return `${sender.first_name || ""} ${sender.last_name || ""}`.trim();
	}
	return sender.username;
};

exports.formatMessagePreview = (message) => {
	if (message.message_type === "text") {
		return message.content;
	} else if (message.message_type === "image") {
		return "📷 Image";
	} else if (message.message_type === "video") {
		return "🎥 Video";
	} else if (message.message_type === "audio") {
		return "🎵 Audio";
	} else {
		return "📎 File";
	}
};

exports.getUnreadCount = async (conversationId, userId) => {
	try {
		const { count, error } = await supabase
			.from("messages")
			.select("*", { count: "exact", head: true })
			.eq("conversation_id", conversationId)
			.neq("sender_id", userId)
			.is("read_at", null)
			.is("deleted_at", null);

		if (error) throw new Error(error.message);
		return count || 0;
	} catch (error) {
		return 0;
	}
};
