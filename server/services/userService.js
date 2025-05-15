const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

// Récupérer un utilisateur par ID (UUID)
const getUserById = async (id) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
};

// Récupérer un utilisateur par email
const getUserByEmail = async (email) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("email", email)
		.single();

	if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
	return data;
};

// Récupérer un utilisateur par nom d'utilisateur
const getUserByUsername = async (username) => {
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.single();

	if (error && error.code !== "PGRST116") throw error;
	return data;
};

// Mettre à jour les infos d'un utilisateur
const updateUser = async (id, updates) => {
	// Filtrer les champs autorisés à être mis à jour
	const allowedUpdates = [
		"first_name",
		"last_name",
		"email",
		"phone_number",
		"bio",
		"gender",
		"username",
		"preferences",
	];

	const filteredUpdates = Object.keys(updates)
		.filter((key) => allowedUpdates.includes(key))
		.reduce((obj, key) => {
			obj[key] = updates[key];
			return obj;
		}, {});

	// Ajouter la date de mise à jour
	filteredUpdates.updated_at = new Date().toISOString();

	const { data, error } = await supabase
		.from("users")
		.update(filteredUpdates)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// Télécharger et mettre à jour l'avatar d'un utilisateur
const updateAvatar = async (id, file) => {
	// Générer un nom de fichier unique
	const fileExtension = file.originalname.split(".").pop();
	const fileName = `${id}_${Date.now()}.${fileExtension}`;

	// Télécharger le fichier vers Supabase Storage
	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(fileName, file.buffer, {
			contentType: file.mimetype,
			upsert: false,
		});

	if (uploadError) throw uploadError;

	// Récupérer l'URL publique
	const {
		data: { publicUrl },
	} = supabase.storage.from("avatars").getPublicUrl(fileName);

	// Mettre à jour l'URL de l'avatar dans la base de données
	const { data, error } = await supabase
		.from("users")
		.update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;

	return { avatar_url: publicUrl };
};

// Changer le mot de passe d'un utilisateur
const changePassword = async (id, currentPassword, newPassword) => {
	try {
		// Récupérer l'utilisateur
		const user = await getUserById(id);

		if (!user) {
			return { success: false, message: "Utilisateur non trouvé" };
		}

		// Vérifier le mot de passe actuel
		const isMatch = await bcrypt.compare(currentPassword, user.password);

		if (!isMatch) {
			return { success: false, message: "Mot de passe actuel incorrect" };
		}

		// Hacher le nouveau mot de passe
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Mettre à jour le mot de passe dans la base de données
		const { error } = await supabase
			.from("users")
			.update({
				password: hashedPassword,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			console.error(
				"Erreur lors de la mise à jour du mot de passe dans la table users:",
				error
			);
			throw error;
		}

		// Mettre à jour le mot de passe dans Supabase Auth
		try {
			// Cette partie peut échouer si l'utilisateur n'existe pas dans auth.users
			// Nous la rendons optionnelle pour éviter de bloquer le changement de mot de passe
			const { error: authError } = await supabase.auth.admin.updateUserById(
				id,
				{ password: newPassword }
			);

			if (authError) {
				console.warn(
					"Avertissement: Impossible de mettre à jour le mot de passe dans auth.users:",
					authError
				);
				// Ne pas lancer d'erreur, continuer l'exécution
			}
		} catch (authUpdateError) {
			console.warn(
				"Avertissement: Erreur lors de la mise à jour du mot de passe dans auth.users:",
				authUpdateError
			);
			// Ne pas lancer d'erreur, continuer l'exécution
		}

		return { success: true, message: "Mot de passe mis à jour avec succès" };
	} catch (error) {
		console.error("Erreur dans changePassword:", error);
		throw error;
	}
};

// Mettre à jour les préférences utilisateur
const updateUserPreferences = async (id, preferences) => {
	try {
		// Convertir les préférences en JSON si ce n'est pas déjà le cas
		const preferencesData =
			typeof preferences === "string"
				? preferences
				: JSON.stringify(preferences);

		const { data, error } = await supabase
			.from("users")
			.update({
				preferences: preferencesData,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error("Erreur lors de la mise à jour des préférences:", error);
		throw error;
	}
};

// Exporter les données utilisateur
const exportUserData = async (id) => {
	try {
		// Récupérer les données de l'utilisateur
		const userData = await getUserById(id);

		if (!userData) {
			return { success: false, message: "Utilisateur non trouvé" };
		}

		// Supprimer le mot de passe des données exportées
		const { password, ...userDataWithoutPassword } = userData;

		// Récupérer d'autres données associées à l'utilisateur (messages, etc.)
		// Exemple:
		// const { data: messages } = await supabase
		//   .from("messages")
		//   .select("*")
		//   .eq("user_id", id)

		return {
			success: true,
			data: {
				user: userDataWithoutPassword,
				// messages: messages || [],
				// Autres données...
				exportDate: new Date().toISOString(),
			},
		};
	} catch (error) {
		console.error("Erreur lors de l'exportation des données:", error);
		throw error;
	}
};

// Supprimer un utilisateur
const deleteUser = async (id) => {
	try {
		// D'abord supprimer de la table users personnalisée
		const { error: userDeleteError } = await supabase
			.from("users")
			.delete()
			.eq("id", id);

		if (userDeleteError) throw userDeleteError;

		// Ensuite essayer de supprimer de auth.users
		try {
			const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
				id
			);

			if (authDeleteError) {
				console.warn(
					"Avertissement: Impossible de supprimer l'utilisateur de auth.users:",
					authDeleteError
				);
				// Ne pas lancer d'erreur, continuer l'exécution
			}
		} catch (authDeleteError) {
			console.warn(
				"Avertissement: Erreur lors de la suppression de l'utilisateur de auth.users:",
				authDeleteError
			);
			// Ne pas lancer d'erreur, continuer l'exécution
		}

		return { success: true, message: "Compte supprimé avec succès" };
	} catch (error) {
		console.error("Erreur lors de la suppression du compte:", error);
		throw error;
	}
};

module.exports = {
	getUserById,
	getUserByEmail,
	getUserByUsername,
	updateUser,
	updateAvatar,
	changePassword,
	deleteUser,
	updateUserPreferences,
	exportUserData,
};
