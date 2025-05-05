const jwt = require("jsonwebtoken");
const userService = require("./userService");

// Générer un token JWT
exports.generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		process.env.JWT_SECRET || "your-secret-key",
		{ expiresIn: "24h" }
	);
};

// Authentifier un utilisateur
exports.authenticateUser = async (email, password) => {
	const user = await userService.verifyUserCredentials(email, password);

	if (!user) {
		return null;
	}

	// Mettre à jour le statut en ligne
	await userService.updateUserOnlineStatus(user.id, true);

	// Générer un token
	const token = exports.generateToken(user);

	return {
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			avatar_url: user.avatar_url,
			bio: user.bio,
		},
	};
};

// Enregistrer un nouvel utilisateur
exports.registerUser = async (userData) => {
	// Vérifier si l'utilisateur existe déjà

	// Créer l'utilisateur

	// Générer un token

	return {};
};

// Déconnecter un utilisateur
exports.logoutUser = async (userId) => {};
