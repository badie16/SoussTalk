const storyService = require("../services/storyService");

exports.createStory = async (req, res) => {
	try {
		const { user_id, media_url, type, caption, background } = req.body;

		// Vérifier que l'utilisateur authentifié est bien celui qui crée la story
		if (req.user.id !== user_id) {
			return res
				.status(403)
				.json({
					error:
						"Vous n'êtes pas autorisé à créer une story pour un autre utilisateur",
				});
		}

		const story = await storyService.createStory(
			user_id,
			media_url,
			type,
			caption,
			background
		);
		res.status(201).json(story);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Récupérer les stories des amis
exports.getFriendsStories = async (req, res) => {
	try {
		const userId = req.user.id; // Récupéré du middleware d'authentification
		const stories = await storyService.getFriendsStories(userId);
		res.json(stories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getActiveStories = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin (à implémenter selon votre logique)
		const isAdmin = req.user.role === "admin";
		if (!isAdmin) {
			return res.status(403).json({ error: "Accès non autorisé" });
		}

		const stories = await storyService.getActiveStories();
		res.json(stories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getUserStories = async (req, res) => {
	try {
		const userId = req.params.userId;

		// Vérifier si l'utilisateur demande ses propres stories ou s'il est ami avec l'utilisateur demandé
		const isSelf = req.user.id === Number(userId);
		const isFriend = await storyService.checkFriendship(req.user.id, userId);

		if (!isSelf && !isFriend) {
			return res
				.status(403)
				.json({
					error:
						"Vous n'êtes pas autorisé à voir les stories de cet utilisateur",
				});
		}

		const stories = await storyService.getUserStories(userId);
		res.json(stories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getStoryById = async (req, res) => {
	try {
		const storyId = req.params.id;
		const story = await storyService.getStoryById(storyId);

		// Vérifier si l'utilisateur est autorisé à voir cette story
		const isSelf = req.user.id === story.user_id;
		const isFriend = await storyService.checkFriendship(
			req.user.id,
			story.user_id
		);

		if (!isSelf && !isFriend) {
			return res
				.status(403)
				.json({ error: "Vous n'êtes pas autorisé à voir cette story" });
		}

		res.json(story);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.markStoryAsViewed = async (req, res) => {
	try {
		const storyId = req.params.id;
		const userId = req.user.id; // Récupéré du middleware d'authentification
    console.log(storyId,userId)
		// Vérifier si l'utilisateur est autorisé à voir cette story
		// const story = await storyService.getStoryById(storyId);
		// const isFriend = await storyService.checkFriendship(userId, story.user_id);

		// if (userId !== story.user_id && !isFriend) {
		// 	return res
		// 		.status(403)
		// 		.json({ error: "Vous n'êtes pas autorisé à voir cette story" });
		// }
    console.log("ssss")
		const result = await storyService.markStoryAsViewed(storyId, userId);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getViewedStories = async (req, res) => {
	try {
		const userId = req.user.id; // Récupéré du middleware d'authentification
		const stories = await storyService.getViewedStories(userId);
		res.json(stories);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.deleteStory = async (req, res) => {
	try {
		const storyId = req.params.id;

		// Vérifier si l'utilisateur est autorisé à supprimer cette story
		const story = await storyService.getStoryById(storyId);
		if (req.user.id !== story.user_id) {
			return res
				.status(403)
				.json({ error: "Vous n'êtes pas autorisé à supprimer cette story" });
		}

		const result = await storyService.deleteStory(storyId);
		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Réagir à une story
exports.reactToStory = async (req, res) => {
	try {
		const storyId = req.params.id;
		const userId = req.user.id;
		const { reaction } = req.body;

		// Vérifier si l'utilisateur est autorisé à voir cette story
		const story = await storyService.getStoryById(storyId);
		const isFriend = await storyService.checkFriendship(userId, story.user_id);

		if (userId !== story.user_id && !isFriend) {
			return res
				.status(403)
				.json({ error: "Vous n'êtes pas autorisé à réagir à cette story" });
		}

		const result = await storyService.reactToStory(storyId, userId, reaction);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Répondre à une story
exports.replyToStory = async (req, res) => {
	try {
		const storyId = req.params.id;
		const userId = req.user.id;
		const { message } = req.body;

		// Vérifier si l'utilisateur est autorisé à voir cette story
		const story = await storyService.getStoryById(storyId);
		const isFriend = await storyService.checkFriendship(userId, story.user_id);

		if (userId !== story.user_id && !isFriend) {
			return res
				.status(403)
				.json({ error: "Vous n'êtes pas autorisé à répondre à cette story" });
		}

		const result = await storyService.replyToStory(storyId, userId, message);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
