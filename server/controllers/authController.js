const e = require("express");
const authService = require("../services/authService");


const signup = async (req, res) => {
	try {
		// Validation simple des champs requis
		const { username, email, password, first_name, last_name, gender } =
			req.body;
		const file = req.file;
		if (
			!username ||
			!email ||
			!password ||
			!first_name ||
			!last_name ||
			!gender
		) {
			return res.status(400).json({
				message: "Veuillez remplir tous les champs obligatoires",
			});
		}
		const user = await authService.signup(req.body, file);
		res.status(201).json({
			message:
				"Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre adresse email.",
			...user,
		});
	} catch (error) {
		// Message d'erreur principal simplifié
		res.status(400).json({
			message: error.message || "Une erreur est survenue lors de l'inscription",
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		// Validation simple
		if (!email || !password) {
			return res.status(400).json({
				message: "Email et mot de passe requis",
			});
		}
		const { token, user } = await authService.login({ email, password });
		res.status(200).json({
			message: "Connexion réussie",
			token,
			user,
		});
	} catch (error) {
		res.status(400).json({
			message: error.message || "Une erreur est survenue lors de la connexion",
		});
	}
};

module.exports = {
	signup,
	login,
};
