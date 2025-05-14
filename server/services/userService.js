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
	
	const getUserProfile = async (req, res) => {
		const { id } = req.params;
	  
		try {
		  const user = await db.getUserById(id);
		  if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		  }
		  res.json(user);
		} catch (error) {
		  console.error("Erreur récupération profil :", error.message);
		  res.status(500).json({ message: "Erreur serveur" });
		}
	  };
	  
	  
	module.exports = {
		getUserById,
		updateUser,
		deleteUser,
		getUserProfile
	};
