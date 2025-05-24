const supabase = require("../config/supabase");

// ✅ Créer un message
exports.createMessage = async ({ senderId, conversationId, content, messageType = "text", fileUrl = null, fileName = null, replyToId = null }) => {
	try {
		const { data: membership } = await supabase
			.from("conversation_members")
			.select("*")
			.eq("conversation_id", conversationId)
			.eq("user_id", senderId)
			.single();

		if (!membership) throw new Error("User is not a member of this conversation");

		const { data, error } = await supabase
			.from("messages")
			.insert([{
				sender_id: senderId,
				conversation_id: conversationId,
				content,
				message_type: messageType,
				file_url: fileUrl,
				file_name: fileName,
				reply_to_id: replyToId,
				created_at: new Date().toISOString()
			}])
			.select("*, sender:users!messages_sender_id_fkey(id, username, avatar_url, first_name, last_name)");

		if (error) throw new Error(error.message);

		return data[0];
	} catch (error) {
		throw new Error(`Error creating message: ${error.message}`);
	}
};

// ✅ Obtenir les messages d'une conversation
exports.getMessagesByConversation = async (conversationId) => {
	try {
		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", conversationId)
			.order("created_at", { ascending: true });

		if (error) throw new Error(error.message);
		return data;
	} catch (error) {
		throw new Error(`Error fetching messages: ${error.message}`);
	}
};

// ✅ Supprimer un message
exports.deleteMessage = async (messageId, userId) => {
	try {
		const { data: message } = await supabase
			.from("messages")
			.select("sender_id")
			.eq("id", messageId)
			.single();

		if (message.sender_id !== userId) throw new Error("Unauthorized");

		const { error } = await supabase
			.from("messages")
			.delete()
			.eq("id", messageId);

		if (error) throw new Error(error.message);
	} catch (error) {
		throw new Error(`Error deleting message: ${error.message}`);
	}
};

// ✅ Modifier un message
exports.editMessage = async ({ messageId, userId, newContent }) => {
	try {
		const { data: message } = await supabase
			.from("messages")
			.select("sender_id")
			.eq("id", messageId)
			.single();

		if (message.sender_id !== userId) throw new Error("Unauthorized");

		const { data, error } = await supabase
			.from("messages")
			.update({ content: newContent })
			.eq("id", messageId)
			.select();

		if (error) throw new Error(error.message);
		return data[0];
	} catch (error) {
		throw new Error(`Error editing message: ${error.message}`);
	}
};

// ✅ Rechercher des messages
exports.searchMessages = async (conversationId, keyword) => {
	try {
		const { data, error } = await supabase
			.from("messages")
			.select("*")
			.eq("conversation_id", conversationId)
			.ilike("content", `%${keyword}%`);

		if (error) throw new Error(error.message);
		return data;
	} catch (error) {
		throw new Error(`Error searching messages: ${error.message}`);
	}
};

// ✅ Ajouter une réaction
exports.addReaction = async ({ messageId, userId, reaction }) => {
	try {
		const { data, error } = await supabase
			.from("emotion_logs")
			.insert([{ message_id: messageId, emotion: reaction, user_id: userId, created_at: new Date() }])
			.select();

		if (error) throw new Error(error.message);
		return data[0];
	} catch (error) {
		throw new Error(`Error adding reaction: ${error.message}`);
	}
};

// ✅ Créer une conversation privée
exports.createPrivateConversation = async ({ user1Id, user2Id }) => {
	try {
		const { data: existing } = await supabase
			.from("conversations")
			.select("id")
			.eq("is_group", false);

		for (const convo of existing) {
			const { data: members } = await supabase
				.from("conversation_members")
				.select("user_id")
				.eq("conversation_id", convo.id);

			const memberIds = members.map(m => m.user_id);
			if (memberIds.includes(user1Id) && memberIds.includes(user2Id) && memberIds.length === 2) {
				return convo;
			}
		}

		const { data: conversation, error } = await supabase
			.from("conversations")
			.insert([{ is_group: false }])
			.select();

		if (error) throw new Error(error.message);

		const conversationId = conversation[0].id;

		await supabase.from("conversation_members").insert([
			{ conversation_id: conversationId, user_id: user1Id },
			{ conversation_id: conversationId, user_id: user2Id }
		]);

		return conversation[0];
	} catch (error) {
		throw new Error(`Error creating private conversation: ${error.message}`);
	}
};

// ✅ Créer un groupe
exports.createGroup = async ({ name, memberIds }) => {
	try {
		const { data: conversation, error } = await supabase
			.from("conversations")
			.insert([{ name, is_group: true }])
			.select();

		if (error) throw new Error(error.message);

		const conversationId = conversation[0].id;
		const membersToAdd = memberIds.map(userId => ({ conversation_id: conversationId, user_id: userId }));

		await supabase.from("conversation_members").insert(membersToAdd);
		return conversation[0];
	} catch (error) {
		throw new Error(`Error creating group: ${error.message}`);
	}
};

// ✅ Ajouter un membre à un groupe
exports.addMemberToGroup = async ({ conversationId, userId }) => {
	try {
		const { error } = await supabase
			.from("conversation_members")
			.insert([{ conversation_id: conversationId, user_id: userId }]);

		if (error) throw new Error(error.message);
	} catch (error) {
		throw new Error(`Error adding member to group: ${error.message}`);
	}
};

// ✅ Supprimer un membre
exports.removeMemberFromGroup = async ({ conversationId, userId }) => {
	try {
		const { error } = await supabase
			.from("conversation_members")
			.delete()
			.match({ conversation_id: conversationId, user_id: userId });

		if (error) throw new Error(error.message);
	} catch (error) {
		throw new Error(`Error removing member: ${error.message}`);
	}
};

// ✅ Récupérer les membres d’un groupe
exports.getConversationMembers = async (conversationId) => {
	try {
		const { data, error } = await supabase
			.from("conversation_members")
			.select("user_id")
			.eq("conversation_id", conversationId);

		if (error) throw new Error(error.message);
		return data;
	} catch (error) {
		throw new Error(`Error fetching members: ${error.message}`);
	}
};

// ✅ Modifier le nom d’un groupe
exports.updateGroupName = async ({ conversationId, newName }) => {
	try {
		const { data, error } = await supabase
			.from("conversations")
			.update({ name: newName })
			.eq("id", conversationId)
			.select();

		if (error) throw new Error(error.message);
		return data[0];
	} catch (error) {
		throw new Error(`Error updating group name: ${error.message}`);
	}
};

// ✅ Récupérer les amis
exports.getUserFriends = async (userId) => {
	try {
		const { data, error } = await supabase
			.from("friendships")
			.select("*")
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

		if (error) throw new Error(error.message);
		return data.map(f => (f.user1_id === userId ? f.user2_id : f.user1_id));
	} catch (error) {
		throw new Error(`Error fetching friends: ${error.message}`);
	}
};

// ✅ Attacher un fichier à un message
exports.attachFileToMessage = async ({ uploaderId, url, fileType, messageId }) => {
	try {
		const { data, error } = await supabase
			.from("files")
			.insert([{ uploader_id: uploaderId, url, file_type: fileType, message_id: messageId }])
			.select();

		if (error) throw new Error(error.message);
		return data[0];
	} catch (error) {
		throw new Error(`Error attaching file: ${error.message}`);
	}
};