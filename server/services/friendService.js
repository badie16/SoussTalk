const supabase = require("../config/supabase");

// Obtenir des suggestions d'amis
exports.getSuggestedFriends = async (userId) => {
	try {
		// Récupérer les amis actuels de l'utilisateur
		const { data: friends } = await supabase
			.from("friendships")
			.select("user1_id, user2_id");

		// Récupérer les demandes envoyées
		const { data: sentRequests } = await supabase
			.from("friend_requests")
			.select("receiver_id")
			.eq("sender_id", userId);

		// Récupérer les demandes reçues
		const { data: receivedRequests } = await supabase
			.from("friend_requests")
			.select("sender_id")
			.eq("receiver_id", userId);

		const friendIds = new Set(
			friends
				? friends.map((f) => (f.user1_id === userId ? f.user2_id : f.user1_id))
				: []
		);
		const sentRequestIds = new Set(
			sentRequests ? sentRequests.map((r) => r.receiver_id) : []
		);
		const receivedRequestIds = new Set(
			receivedRequests ? receivedRequests.map((r) => r.sender_id) : []
		);

		const excludeIds = [...friendIds, ...sentRequestIds, ...receivedRequestIds];
		const excludeIdsString = excludeIds.length
			? `(${excludeIds.join(",")})`
			: "(null)";

		const { data: suggestions, error } = await supabase
			.from("users")
			.select("id, first_name, last_name, username, avatar_url, created_at")
			.neq("id", userId)
			.not("id", "in", excludeIdsString)
			.limit(10);

		if (error) throw error;

		if (!suggestions) return [];

		const suggestionsWithMutualFriends = await Promise.all(
			suggestions.map(async (user) => {
				const mutualFriends = await getMutualFriendsCount(userId, user.id);
				return {
					id: user.id,
					name: user.first_name + " " + user.last_name,
					username: user.username,
					avatar: user.avatar_url,
					initials: getInitials(user.first_name + " " + user.last_name),
					mutualFriends,
					isFriend: false,
					requestSent: false,
					requestReceived: false,
				};
			})
		);

		return suggestionsWithMutualFriends.sort(
			(a, b) => b.mutualFriends - a.mutualFriends
		);
	} catch (error) {
		console.error("Erreur lors de l'obtention des suggestions d'amis:", error);
		throw error;
	}
};

// Obtenir les demandes d'amitié
exports.getFriendRequests = async (userId) => {
	try {
		const { data, error } = await supabase
			.from("friend_requests")
			.select(
				`
        id,
        sender_id,
        created_at,
        users:sender_id (first_name, last_name, username, avatar_url)
      `
			)
			.eq("receiver_id", userId)
			.eq("status", "pending");
		if (error) throw error;

		return data.map((request) => ({
			id: request.sender_id,
			name: request.users.first_name + " " + request.users.last_name,
			username: request.users.username,
			avatar: request.users.avatar_url,
			initials: getInitials(request.users.name),
			timeAgo: formatTimeAgo(request.created_at),
		}));
	} catch (error) {
		console.error("Erreur lors de l'obtention des demandes d'amitié:", error);
		throw error;
	}
};

// Envoyer une demande d'amitié
exports.sendFriendRequest = async (senderId, receiverId) => {
	try {
		const { data: existingRequest } = await supabase
			.from("friend_requests")
			.select("*")
			.or(
				`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
			)
			.eq("status", "pending");

		if (existingRequest.length > 0) {
			throw new Error("Demande d'amitié déjà envoyée ou reçue.");
		}
		const { error } = await supabase.from("friend_requests").insert({
			sender_id: senderId,
			receiver_id: receiverId,
			status: "pending",
		});

		if (error) throw error;
	} catch (error) {
		console.error("Erreur lors de l'envoi de la demande d'amitié:", error);
		throw error;
	}
};

// Annuler une demande d'amitié
exports.cancelFriendRequest = async (senderId, receiverId) => {
	try {
		const { error } = await supabase
			.from("friend_requests")
			.delete()
			.eq("sender_id", senderId)
			.eq("receiver_id", receiverId);

		if (error) throw error;
	} catch (error) {
		console.error("Erreur lors de l'annulation de la demande d'amitié:", error);
		throw error;
	}
};

// Accepter une demande d'amitié
exports.acceptFriendRequest = async (receiverId, senderId) => {
	try {
		console.log(receiverId, "  ", senderId);
		// Mettre à jour le statut de la demande
		const { error: updateError } = await supabase
			.from("friend_requests")
			.update({ status: "accepted" })
			.eq("sender_id", senderId)
			.eq("receiver_id", receiverId);
		if (updateError) throw updateError;
		console.log(receiverId, "  ", senderId);
		// Ajouter les deux utilisateurs comme amis
		const { error: insertError } = await supabase.from("friendships").insert({
			user1_id: receiverId,
			user2_id: senderId,
		});
		if (insertError) throw insertError;
	} catch (error) {
		console.error(
			"Erreur lors de l'acceptation de la demande d'amitié:",
			error
		);
		throw error;
	}
};

// Rejeter une demande d'amitié
exports.rejectFriendRequest = async (receiverId, senderId) => {
	try {
		const { error } = await supabase
			.from("friend_requests")
			.update({ status: "rejected" })
			.eq("sender_id", senderId)
			.eq("receiver_id", receiverId);

		if (error) throw error;
	} catch (error) {
		console.error("Erreur lors du rejet de la demande d'amitié:", error);
		throw error;
	}
};

// Supprimer un ami
exports.removeFriend = async (userId, friendId) => {
	try {
		// Supprimer dans les deux sens
		const { error: error } = await supabase
			.from("friendships")
			.delete()
			.or(
				`and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${userId})`
			);
		if (error) throw error;
	} catch (error) {
		console.error("Erreur lors de la suppression de l'ami:", error);
		throw error;
	}
};

// Obtenir la liste des amis
exports.getFriends = async (userId) => {
	try {
		// Étape 1 : récupérer toutes les relations où userId est soit user1_id soit user2_id
		const { data: friendships, error: friendshipError } = await supabase
			.from("friendships")
			.select("user1_id,user2_id")
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

		if (friendshipError) throw friendshipError;

		// Étape 2 : récupérer les IDs des amis (l'autre utilisateur dans la relation)
		const friendIds = friendships.map((f) =>
			f.user1_id === userId ? f.user2_id : f.user1_id
		);

		if (friendIds.length === 0) return [];

		// Étape 3 : récupérer les infos des amis en lot
		const { data: friends, error: friendsError } = await supabase
			.from("users")
			.select("id,first_name,last_name,username,avatar_url")
			.in("id", friendIds);

		if (friendsError) throw friendsError;

		// Étape 4 : formater la réponse
		return friends.map((friend) => ({
			id: friend.id,
			name: friend.first_name + " " + friend.last_name,
			username: friend.username,
			avatar: friend.avatar_url,
			initials: getInitials(friend.first_name + " " + friend.last_name),
		}));
	} catch (error) {
		console.error("Erreur lors de l'obtention des amis:", error);
		throw error;
	}
};

// Fonctions utilitaires

// Obtenir le nombre d'amis en commun entre deux utilisateurs
// Récupérer les amis d’un utilisateur
async function getFriendIds(userId) {
	const { data, error } = await supabase
		.from("friendships")
		.select("user1_id, user2_id")
		.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

	if (error || !data) return [];

	return data.map((f) => (f.user1_id === userId ? f.user2_id : f.user1_id));
}

async function getMutualFriendsCount(userId1, userId2) {
	try {
		const friends1 = await getFriendIds(userId1);
		const friends2 = await getFriendIds(userId2);

		const set1 = new Set(friends1);
		const set2 = new Set(friends2);

		let count = 0;
		for (const id of set1) {
			if (set2.has(id)) count++;
		}
		return count;
	} catch (error) {
		console.error("Erreur lors du calcul des amis en commun:", error);
		return 0;
	}
}

exports.searchFriends = async (userId, searchTerm) => {
	try {
		const { data: friends } = await supabase
			.from("friendships")
			.select("user1_id, user2_id");

		const friendIds = new Set(
			friends
				? friends
						.filter((f) => f.user1_id === userId || f.user2_id === userId)
						.map((f) => (f.user1_id === userId ? f.user2_id : f.user1_id))
				: []
		);
		console.log(searchTerm);
		const { data, error } = await supabase
			.from("users")
			.select("id, first_name, last_name, username, avatar_url")
			.ilike("username", `%${searchTerm}%`)
			.neq("id", userId);

		if (error) throw error;

		return data.map((user) => ({
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			username: user.username,
			avatar: user.avatar_url,
			initials: getInitials(`${user.first_name} ${user.last_name}`),
			isFriend: friendIds.has(user.id),
		}));
	} catch (error) {
		console.error("Erreur lors de la recherche d'utilisateurs:", error);
		throw error;
	}
};


// Obtenir les initiales à partir d'un nom
function getInitials(name) {
	if (!name) return "";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
}

// Formater le temps écoulé
function formatTimeAgo(dateString) {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now - date;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffWeek = Math.floor(diffDay / 7);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	if (diffSec < 60) return "il y a quelques secondes";
	if (diffMin < 60) return `il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
	if (diffHour < 24)
		return `il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
	if (diffDay < 7) return `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
	if (diffWeek < 4)
		return `il y a ${diffWeek} semaine${diffWeek > 1 ? "s" : ""}`;
	if (diffMonth < 12) return `il y a ${diffMonth} mois`;
	return `il y a ${diffYear} an${diffYear > 1 ? "s" : ""}`;
}
