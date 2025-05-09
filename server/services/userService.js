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

// Mettre à jour les infos d'un utilisateur
const updateUser = async (id, updates) => {
	const { data, error } = await supabase
		.from("users")
		.update(updates)
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
};

// Supprimer un utilisateur
const deleteUser = async (id) => {
	// First delete from custom users table
	const { error: userDeleteError } = await supabase
		.from("users")
		.delete()
		.eq("id", id);

	if (userDeleteError) throw userDeleteError;

	// Then delete from auth.users
	const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);

	if (authDeleteError) throw authDeleteError;

	return { success: true };
};

module.exports = {
	getUserById,
	updateUser,
	deleteUser,
};
