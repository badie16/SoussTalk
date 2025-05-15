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
		.update({ password: hashedPassword, updated_at: new Date().toISOString() })
		.eq("id", id);

	if (error) throw error;

	// Mettre à jour le mot de passe dans Supabase Auth
	const { error: authError } = await supabase.auth.admin.updateUserById(id, {
		password: newPassword,
	});

	if (authError) throw authError;

	return { success: true };
};

// Supprimer un utilisateur
const deleteUser = async (id) => {
	// D'abord supprimer de la table users personnalisée
	const { error: userDeleteError } = await supabase
		.from("users")
		.delete()
		.eq("id", id);

	if (userDeleteError) throw userDeleteError;

	// Ensuite supprimer de auth.users
	const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);

	if (authDeleteError) throw authDeleteError;

	return { success: true };
};

module.exports = {
	getUserById,
	getUserByEmail,
	getUserByUsername,
	updateUser,
	updateAvatar,
	changePassword,
	deleteUser,
};
