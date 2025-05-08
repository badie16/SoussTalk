const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const signup = async (userData) => {
	const {
		username,
		email,
		password,
		gender = "",
		avatar_url = "",
		bio = "",
		phone_number = "",
		first_name = "",
		last_name = "",
	} = userData;

	// First, create the user in auth.users using Supabase Auth
	const { data: authUser, error: authError } = await supabase.auth.signUp({
		email,
		password,
	});

	if (authError) {
		throw new Error(`Erreur d'authentification: ${authError.message}`);
	}

	// Get the UUID from the newly created auth user
	const uuid = authUser.user.id;

	// Check if username already exists in our custom users table
	const { data: existingUser, error: checkError } = await supabase
		.from("users")
		.select("*")
		.eq("username", username)
		.maybeSingle();

	if (checkError) {
		throw new Error("Erreur lors de la vérification de l'utilisateur");
	}

	if (existingUser) {
		// If username exists, we need to delete the auth user we just created
		await supabase.auth.admin.deleteUser(uuid);
		throw new Error("Nom d'utilisateur déjà utilisé");
	}

	// Insert the user in our custom users table with the UUID from auth.users
	const { data, error: insertError } = await supabase
		.from("users")
		.insert([
			{
				id: uuid, // Use the UUID from auth.users as the primary key
				username,
                password,
				email,
				gender,
				avatar_url,
				bio,
				phone_number,
				first_name,
				last_name,
			},
		])
		.select();

	if (insertError) {
		// If insertion fails, delete the auth user
		await supabase.auth.admin.deleteUser(uuid);
		throw insertError;
	}

	// Generate JWT token
	const token = jwt.sign({ id: uuid }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});

	return { token, user: data[0] };
};

const login = async ({ email, password }) => {
	// First authenticate with Supabase Auth
	const { data: authData, error: authError } =
		await supabase.auth.signInWithPassword({
			email,
			password,
		});

	if (authError) {
		throw new Error("Email ou mot de passe incorrect");
	}

	// Get the user from our custom users table using the UUID
	const { data: user, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", authData.user.id)
		.single();

	if (error || !user) {
		throw new Error("Utilisateur non trouvé dans la base de données");
	}

	// Generate JWT token
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});

	return { token, user };
};

module.exports = { signup, login };
