const supabase = require("../config/supabase");

// ✅ Créer un message
exports.createMessage = async ({ senderId, receiverId, text }) => {
	const { data, error } = await supabase
		.from('messages')
		.insert([{ sender_id: senderId, content: text }])
		.select();

	if (error) throw new Error(error.message);

	return data[0];
};

// ✅ Obtenir les messages d'une conversation
exports.getMessagesByConversation = async (conversationId) => {
	const { data, error } = await supabase
		.from('messages')
		.select('*')
		.eq('conversation_id', conversationId)
		.order('created_at', { ascending: true });

	if (error) throw new Error(error.message);

	return data;
};

// ✅ Supprimer un message
exports.deleteMessage = async (messageId) => {
	const { error } = await supabase
		.from('messages')
		.delete()
		.eq('id', messageId);

	if (error) throw new Error(error.message);
};

// ✅ Modifier un message
exports.editMessage = async (messageId, newContent) => {
	const { data, error } = await supabase
		.from('messages')
		.update({ content: newContent })
		.eq('id', messageId)
		.select();

	if (error) throw new Error(error.message);

	return data[0];
};

// ✅ Rechercher des messages dans une conversation
exports.searchMessages = async (conversationId, keyword) => {
	const { data, error } = await supabase
		.from('messages')
		.select('*')
		.eq('conversation_id', conversationId)
		.ilike('content', `%${keyword}%`);

	if (error) throw new Error(error.message);

	return data;
};

// ✅ Marquer les messages comme lus dans une conversation
exports.markMessagesAsRead = async (conversationId, userId) => {
	// ici tu peux gérer une logique de "read receipts" si tu as une colonne spéciale, par exemple `is_read`
	// Sinon tu peux implémenter une table à part pour les accusés de lecture
	// Exemple fictif :
	return; // à implémenter selon ta logique
};

// ✅ Ajouter une réaction à un message
exports.addReaction = async (messageId, userId, reaction) => {
	const { data, error } = await supabase
		.from('emotion_logs')
		.insert([{ message_id: messageId, emotion: reaction }])
		.select();

	if (error) throw new Error(error.message);

	return data[0];
};

// ✅ Créer une conversation privée (vérifie si elle existe déjà)
exports.createPrivateConversation = async (user1Id, user2Id) => {
	// Vérifie s’il existe déjà une conversation à 2
	const { data: existing } = await supabase
		.from('conversations')
		.select('id')
		.eq('is_group', false);

	for (const convo of existing) {
		const { data: members } = await supabase
			.from('conversation_members')
			.select('user_id')
			.eq('conversation_id', convo.id);

		const memberIds = members.map(m => m.user_id);
		if (memberIds.includes(user1Id) && memberIds.includes(user2Id) && memberIds.length === 2) {
			return convo;
		}
	}

	// Sinon crée une nouvelle conversation privée
	const { data: newConversation, error: convoError } = await supabase
		.from('conversations')
		.insert([{ is_group: false }])
		.select();

	if (convoError) throw new Error(convoError.message);

	const conversationId = newConversation[0].id;

	// Ajouter les deux utilisateurs à la conversation
	const { error: membersError } = await supabase
		.from('conversation_members')
		.insert([
			{ conversation_id: conversationId, user_id: user1Id },
			{ conversation_id: conversationId, user_id: user2Id }
		]);

	if (membersError) throw new Error(membersError.message);

	return newConversation[0];
};

// ✅ Créer un groupe
exports.createGroup = async (name, memberIds) => {
	const { data: conversation, error } = await supabase
		.from('conversations')
		.insert([{ is_group: true, name }])
		.select();

	if (error) throw new Error(error.message);

	const conversationId = conversation[0].id;

	const membersToAdd = memberIds.map(userId => ({
		conversation_id: conversationId,
		user_id: userId
	}));

	const { error: membersError } = await supabase
		.from('conversation_members')
		.insert(membersToAdd);

	if (membersError) throw new Error(membersError.message);

	return conversation[0];
};

// ✅ Ajouter un membre à un groupe
exports.addMemberToGroup = async (conversationId, userId) => {
	const { error } = await supabase
		.from('conversation_members')
		.insert([{ conversation_id: conversationId, user_id: userId }]);

	if (error) throw new Error(error.message);
};

// ✅ Supprimer un membre d’un groupe
exports.removeMemberFromGroup = async (conversationId, userId) => {
	const { error } = await supabase
		.from('conversation_members')
		.delete()
		.match({ conversation_id: conversationId, user_id: userId });

	if (error) throw new Error(error.message);
};

// ✅ Récupérer les membres d’un groupe
exports.getConversationMembers = async (conversationId) => {
	const { data, error } = await supabase
		.from('conversation_members')
		.select('user_id')
		.eq('conversation_id', conversationId);

	if (error) throw new Error(error.message);

	return data;
};

// ✅ Modifier le nom d’un groupe
exports.updateGroupName = async (conversationId, newName) => {
	const { data, error } = await supabase
		.from('conversations')
		.update({ name: newName })
		.eq('id', conversationId)
		.select();

	if (error) throw new Error(error.message);

	return data[0];
};

// ✅ Récupérer les amis d’un utilisateur
exports.getUserFriends = async (userId) => {
	const { data, error } = await supabase
		.from('friendships')
		.select('*')
		.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

	if (error) throw new Error(error.message);

	// Renvoyer l’ID de l’ami (pas userId lui-même)
	return data.map(f => (f.user1_id === userId ? f.user2_id : f.user1_id));
};

// ✅ Télécharger un fichier et l’associer à un message (appelé dans uploadFile middleware)
exports.attachFileToMessage = async ({ uploaderId, url, fileType, messageId }) => {
	const { data, error } = await supabase
		.from('files')
		.insert([{ uploader_id: uploaderId, url, file_type: fileType, message_id: messageId }])
		.select();

	if (error) throw new Error(error.message);

	return data[0];
};
