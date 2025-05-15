const userService = require("../services/userService");

// Récupérer le profil d'un utilisateur
const getUserProfile = async (req, res) => {
	try {
		const { id } = req.params;
		console.log("ID demandé:", id); // Log pour débogage
		console.log("Utilisateur authentifié:", req.user.id); // Log pour débogage

		// Vérifier que l'utilisateur demande son propre profil ou est admin
		// Temporairement désactivé pour le débogage
		// if (req.user.id !== id && req.user.role !== "admin") {
		//   return res.status(403).json({ message: "Accès non autorisé" })
		// }

		const user = await userService.getUserById(id);

		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}

		// Ne pas renvoyer le mot de passe
		const { password, ...userWithoutPassword } = user;

		res.status(200).json(userWithoutPassword);
	} catch (error) {
		console.error("Erreur récupération profil:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

// Mettre à jour le profil d'un utilisateur
const updateUserProfile = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		// Vérifier que l'utilisateur met à jour son propre profil ou est admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		// Validation des données
		if (updates.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(updates.email)) {
				return res.status(400).json({ message: "Format d'email invalide" });
			}

			// Vérifier si l'email est déjà utilisé par un autre utilisateur
			const existingUser = await userService.getUserByEmail(updates.email);
			if (existingUser && existingUser.id !== id) {
				return res.status(400).json({ message: "Cet email est déjà utilisé" });
			}
		}

		// Mettre à jour l'utilisateur
		const updatedUser = await userService.updateUser(id, updates);

		// Ne pas renvoyer le mot de passe
		const { password, ...userWithoutPassword } = updatedUser;

		res.status(200).json(userWithoutPassword);
	} catch (error) {
		console.error("Erreur mise à jour profil:", error);

		if (error.message.includes("duplicate key")) {
			return res
				.status(400)
				.json({ message: "Cet email ou nom d'utilisateur est déjà utilisé" });
		}

		res.status(500).json({ message: "Erreur serveur" });
	}
};

// Mettre à jour l'avatar d'un utilisateur
const updateUserAvatar = async (req, res) => {
	try {
		const { id } = req.params;

		// Vérifier que l'utilisateur met à jour son propre avatar ou est admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		// Vérifier si un fichier a été téléchargé
		if (!req.file) {
			return res.status(400).json({ message: "Aucun fichier téléchargé" });
		}

		// Vérifier le type de fichier
		if (!req.file.mimetype.startsWith("image/")) {
			return res
				.status(400)
				.json({ message: "Le fichier doit être une image" });
		}

		// Vérifier la taille du fichier (max 2MB)
		if (req.file.size > 2 * 1024 * 1024) {
			return res
				.status(400)
				.json({ message: "L'image ne doit pas dépasser 2 Mo" });
		}

		// Télécharger l'avatar et mettre à jour l'utilisateur
		const result = await userService.updateAvatar(id, req.file);

		res.status(200).json({ avatar_url: result.avatar_url });
	} catch (error) {
		console.error("Erreur mise à jour avatar:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

// Changer le mot de passe d'un utilisateur
const changeUserPassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { currentPassword, newPassword } = req.body;

		// Vérifier que l'utilisateur change son propre mot de passe ou est admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		// Validation des données
		if (!currentPassword || !newPassword) {
			return res
				.status(400)
				.json({
					message: "Mot de passe actuel et nouveau mot de passe requis",
				});
		}

		if (newPassword.length < 8) {
			return res
				.status(400)
				.json({
					message:
						"Le nouveau mot de passe doit contenir au moins 8 caractères",
				});
		}

		// Changer le mot de passe
		const result = await userService.changePassword(
			id,
			currentPassword,
			newPassword
		);

		if (!result.success) {
			return res.status(400).json({ message: result.message });
		}

		res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
	} catch (error) {
		console.error("Erreur changement mot de passe:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};

module.exports = {
	getUserProfile,
	updateUserProfile,
	updateUserAvatar,
	changeUserPassword,
};
