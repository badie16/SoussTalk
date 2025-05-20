const { Console } = require("console");
const supabase = require("../config/supabase");

exports.createStory = async (
	user_id,
	media_url,
	type,
	caption,
	background = ""
) => {
	// Calculer la date d'expiration (24 heures après la création)
	const now = new Date();
	const expires_at = new Date(
		now.getTime() + 24 * 60 * 60 * 1000
	).toISOString();

	const { data, error } = await supabase
		.from("stories")
		.insert([
			{
				user_id,
				media_url,
				type,
				caption,
				background,
				expires_at,
			},
		])
		.select("*, users(username)")
		.single();

	if (error) throw new Error(error.message);
	return data;
};

// Récupérer les stories actives des amis de l'utilisateur
exports.getFriendsStories = async (userId) => {
	try {
		// 1. Récupérer la liste des amis de l'utilisateur
		const { data: friendships, error: friendshipError } = await supabase
			.from("friendships")
			.select("user1_id, user2_id")
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

		if (friendshipError) throw new Error(friendshipError.message);
		// 2. Extraire les IDs des amis
		const friendIds = friendships.map((friendship) =>
			friendship.user1_id === userId ? friendship.user2_id : friendship.user1_id
		);

		// Ajouter l'ID de l'utilisateur lui-même pour voir ses propres stories
		friendIds.push(userId);
		// 3. Si aucun ami, retourner un tableau vide
		if (friendIds.length === 0) return [];

		// 4. Récupérer les stories actives des amis
		const { data: stories, error: storiesError } = await supabase
			.from("stories")
			.select("*, users(username)")
			.in("user_id", friendIds)
			.gt("expires_at", new Date().toISOString())
			.order("created_at", { ascending: false });

		if (storiesError) throw new Error(storiesError.message);
		return stories || [];
	} catch (error) {
		console.error("Erreur lors Récupérer les stories actives des amie", error);
		throw error;
	}
};

exports.getActiveStories = async () => {
	const { data, error } = await supabase
		.from("stories")
		.select("*, users(username)")
		.gt("expires_at", new Date().toISOString())
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data;
};

exports.getUserStories = async (userId) => {
	const { data, error } = await supabase
		.from("stories")
		.select("*, users(username)")
		.eq("user_id", userId)
		.gt("expires_at", new Date().toISOString())
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data;
};

exports.getStoryById = async (storyId) => {
	const { data, error } = await supabase
		.from("stories")
		.select("*, users(username)")
		.eq("id", storyId)
		.single();

	if (error) throw new Error(error.message);
	return data;
};

exports.markStoryAsViewed = async (storyId, userId) => {
	console.log("fffffffffff");
	// Vérifier si la vue existe déjà
	const { data: existingView, error: checkError } = await supabase
		.from("story_views")
		.select("*")
		.eq("story_id", storyId)
		.eq("user_id", userId)
		.single();

	if (checkError && checkError.code !== "PGRST116") {
		throw new Error(checkError.message);
	}

	// Si la vue n'existe pas, l'ajouter
	if (!existingView) {
		const { error: insertError } = await supabase
			.from("story_views")
			.insert([{ story_id: storyId, user_id: userId }]);

		if (insertError) throw new Error(insertError.message);
	}

	return { success: true };
};

exports.getViewedStories = async (userId) => {
	const { data, error } = await supabase
		.from("story_views")
		.select("story_id")
		.eq("user_id", userId);
	if (error) throw new Error(error.message);

	const storyIds = data.map((view) => view.story_id);

	if (storyIds.length === 0) {
		return [];
	}

	const { data: stories, error: storiesError } = await supabase
		.from("stories")
		.select("*, users(username)")
		.in("id", storyIds)
		.gt("expires_at", new Date().toISOString())
		.order("created_at", { ascending: false });

	if (storiesError) throw new Error(storiesError.message);
	return stories;
};

exports.deleteStory = async (storyId) => {
	const { error } = await supabase.from("stories").delete().eq("id", storyId);

	if (error) throw new Error(error.message);
	return { message: "Story deleted successfully" };
};
// Réagir à une story
exports.reactToStory = async (storyId, userId, reaction) => {
	// Vérifier si une réaction existe déjà
	const { data: existingReaction, error: checkError } = await supabase
		.from("story_reactions")
		.select("*")
		.eq("story_id", storyId)
		.eq("user_id", userId)
		.single();

	if (checkError && checkError.code !== "PGRST116") {
		throw new Error(checkError.message);
	}

	// Si une réaction existe, la mettre à jour, sinon en créer une nouvelle
	if (existingReaction) {
		const { error: updateError } = await supabase
			.from("story_reactions")
			.update({ reaction, updated_at: new Date().toISOString() })
			.eq("id", existingReaction.id);

		if (updateError) throw new Error(updateError.message);
	} else {
		const { error: insertError } = await supabase
			.from("story_reactions")
			.insert([{ story_id: storyId, user_id: userId, reaction }]);

		if (insertError) throw new Error(insertError.message);
	}

	return { success: true };
};

// Répondre à une story
exports.replyToStory = async (storyId, userId, message) => {
	const { data, error } = await supabase
		.from("story_replies")
		.insert([{ story_id: storyId, user_id: userId, message }])
		.select()
		.single();

	if (error) throw new Error(error.message);
	return data;
};
