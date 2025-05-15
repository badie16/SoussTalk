const jwt = require("jsonwebtoken");
const { getUserById } = require("../services/userService");
const supabase = require("../config/supabase");

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
	try {
		let token;
		// Récupérer le token du header
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		}
		// Vérifier si le token existe
		if (!token) {
			return res.status(401).json({ message: "Non autorisé, aucun token" });
		}

		// Vérifier le token avec Supabase Auth
		// Correction: getSession() ne prend pas de token en paramètre
		const { data: sessionData, error: sessionError } =
			await supabase.auth.getSession();

		if (sessionError || !sessionData.session) {
			return res.status(401).json({ message: "Non autorisé, token invalide" });
		}

		// Vérifier que le token correspond à la session
		if (token !== sessionData.session.access_token) {
			return res.status(401).json({ message: "Non autorisé, token invalide" });
		}

		const userId = sessionData.session.user.id;
		// Récupérer l'utilisateur à partir de notre table personnalisée
		const user = await getUserById(userId);
		if (!user) {
			return res.status(401).json({ message: "Utilisateur non trouvé" });
		}
		// Ajouter l'utilisateur à la requête
		req.user = user;
		next();
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(401).json({ message: "Non autorisé, token invalide" });
	}
};
