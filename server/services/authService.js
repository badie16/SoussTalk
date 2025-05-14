const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const signup = async (userData, profilePicture) => {
	const {
		username,
		email,
		password,
		gender = "",
		bio = "",
		phone_number = "",
		first_name = "",
		last_name = "",
	} = userData;
	// First, Vérifier si l'email existe déjà dans la table "users"
	const { data: existingEmail, error: emailCheckError } = await supabase
		.from("users")
		.select("id")
		.eq("email", email)
		.maybeSingle();

	if (emailCheckError) {
		if (
			emailCheckError.message.includes("fetch failed") || // fetch natif échoué
			emailCheckError.message.includes("Failed to fetch") || // fetch navigateur
			emailCheckError.message.includes("NetworkError") || // erreur de réseau général
			emailCheckError.message.includes("Timeout") // timeout générique
		) {
			throw new Error("Erreur réseau. vérifiez votre connexion.");
		}
		throw new Error("Erreur lors de la vérification de l'email.");
	}

	if (existingEmail) {
		throw new Error("Cette adresse email est déjà utilisée.");
	}

	const { data: existingUsername, error: usernameCheckError } = await supabase
		.from("users")
		.select("id")
		.eq("username", username)
		.maybeSingle();

	if (usernameCheckError) {
		throw new Error("Erreur lors de la vérification du nom d'utilisateur.");
	}

	if (existingUsername) {
		throw new Error(
			"Nom d'utilisateur déjà utilisé. Veuillez en choisir un autre."
		);
	}

	// create the user in auth.users using Supabase Auth
	const { data: authUser, error: authError } = await supabase.auth.signUp({
		email,
		password,
	});

	if (authError) {
		// Ex: adresse déjà utilisée ou format invalide
		if (authError.message.includes("User already registered")) {
			throw new Error("Cette adresse email est déjà utilisée.");
		}
		throw new Error(
			`Erreur lors de la création du compte: ${authError.message}`
		);
	}
	// Get the UUID from the newly created auth user
	const uuid = authUser.user.id;

	// Hachage du mot de passe
	const hashedPassword = await bcrypt.hash(password, 10);

	// Upload de avatar vers Supabase
	let avatar_url = "";
	if (profilePicture) {
		try {
			// Générer un nom de fichier unique
			const fileExtension = profilePicture.originalname.split(".").pop();
			const fileName = `${uuid}_${Date.now()}.${fileExtension}`;

			// Upload vers Supabase Storage
			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(fileName, profilePicture.buffer, {
					contentType: profilePicture.mimetype,
					upsert: false,
				});

			if (uploadError) {
				console.error("Erreur upload avatar:", uploadError);
			}
			// Récupération de l'URL publique
			const {
				data: { publicUrl },
			} = supabase.storage.from("avatars").getPublicUrl(fileName);

			avatar_url = publicUrl;
			console.log(avatar_url);
		} catch (uploadError) {
			console.error("Erreur traitement avatar:", uploadError);
			// On continue sans avatar si l'upload échoue
		}
	}

	// Insert the user in our custom users table with the UUID from auth.users
	const { data, error: insertError } = await supabase
		.from("users")
		.insert([
			{
				id: uuid, // Use the UUID from auth.users as the primary key
				username,
				password: hashedPassword,
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
		await supabase.auth.admin.deleteUser(uuid);
		// If insertion fails, delete the auth user
		if (insertError.message.includes("duplicate key value")) {
			throw new Error(
				"Nom d'utilisateur ou email déjà utilisé. Veuillez réessayer."
			);
		}
		throw insertError;
	}
	// Generate JWT token
	const token = jwt.sign({ id: uuid }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});

	return { token, user: data[0] };
};

const login = async ({ email, password }) => {
	// Authentification avec Supabase
	const { data: authData, error: authError } =
		await supabase.auth.signInWithPassword({
			email,
			password,
		});

	if (authError) {
		if (authError.code === "email_not_confirmed") {
			throw new Error("Email non confirmé. Veuillez confirmer votre email.");
		} else if (
			authError.message.includes("fetch failed") || // fetch natif échoué
			authError.message.includes("Failed to fetch") || // fetch navigateur
			authError.message.includes("NetworkError") || // erreur de réseau général
			authError.message.includes("Timeout") // timeout générique
		) {
			throw new Error("Erreur réseau. vérifiez votre connexion.");
		}
		throw new Error("Email ou mot de passe incorrect");
	}
	// Récupérer l'utilisateur de la table personnalisée
	const { data: user, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", authData.user.id)
		.single();

	if (error || !user) {
		throw new Error("Email ou mot de passe incorrect");
	}

	// Génération du token JWT
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
		expiresIn: "1h",
	});
	return { token, user };
};


module.exports = { signup, login };