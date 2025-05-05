const authService = require("../services/authService");
const userService = require("../services/userService");

// Contrôleur de connexion
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Valider les entrées
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email et mot de passe sont requis" });
		}

		// Authentifier l'utilisateur
		const authData = await authService.authenticateUser(email, password);

		if (!authData) {
			return res.status(401).json({ message: "Identifiants invalides" });
		}

		// Envoyer la réponse
		res.status(200).json({
			message: "Connexion réussie",
			token: authData.token,
			user: authData.user,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

// Contrôleur d'inscription
exports.register = async (req, res) => {
	// register
};

// Contrôleur de déconnexion
exports.logout = async (req, res) => {
	try {
		const userId = req.user.id;

		// Mettre à jour le statut en ligne
		await authService.logoutUser(userId);

		res.status(200).json({ message: "Déconnexion réussie" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

// Contrôleur pour récupérer le profil utilisateur
exports.getMe = async (req, res) => {
	try {
		const user = await userService.getUserById(req.user.id);

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};
