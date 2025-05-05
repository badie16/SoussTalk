const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

// Récupérer un utilisateur par son ID
exports.getUserById = async (id) => {
	const { data: user, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", id)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return user;
};

// Récupérer un utilisateur par son email
exports.getUserByEmail = async (email) => {
	const { data: user, error } = await supabase
		.from("users")
		.select("*")
		.eq("email", email)
		.single();

	if (error && error.code !== "PGRST116") {
		// PGRST116 est le code d'erreur quand aucun résultat n'est trouvé
		throw new Error(error.message);
	}

	return user;
};

// Récupérer un utilisateur par son nom d'utilisateur
exports.getUserByUsername = async (username) => {
	const { data: user, error } = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.single();

	if (error && error.code !== "PGRST116") {
		throw new Error(error.message);
	}

	return user;
};

// Créer un nouvel utilisateur
exports.createUser = async (userData) => {
	// Créer d'abord l'utilisateur dans auth.users

	// Hacher le mot de passe pour notre table users personnalisée

	// Créer l'utilisateur dans notre table users personnalisée

	// Supprimer l'utilisateur auth si la création dans users échoue

	return {};
};

// Mettre à jour le statut en ligne d'un utilisateur
exports.updateUserOnlineStatus = async (userId, isOnline) => {};

// Vérifier les identifiants de l'utilisateur
exports.verifyUserCredentials = async (email, password) => {
	const user = await exports.getUserByEmail(email);
	if (!user) {
		return null;
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return null;
	}
	return user;
};
