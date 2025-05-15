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
			console.log("Token reçu:", token); // Log pour débogage
		}

		// Vérifier si le token existe
		if (!token) {
			console.log("Aucun token fourni"); // Log pour débogage
			return res.status(401).json({ message: "Non autorisé, aucun token" });
		}

		try {
			// Vérifier le token JWT
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "votre_secret_par_defaut"
			);

			// Récupérer l'utilisateur à partir de notre table personnalisée
			const user = await getUserById(decoded.id);

			if (!user) {
				console.log("Utilisateur non trouvé pour l'ID:", decoded.id); // Log pour débogage
				return res.status(401).json({ message: "Utilisateur non trouvé" });
			}

			// Ajouter l'utilisateur à la requête
			req.user = user;
			next();
		} catch (jwtError) {
			console.error("Erreur JWT:", jwtError); // Log pour débogage

			// Si le token JWT est invalide, essayer avec Supabase comme fallback
			try {
				// Vérifier avec Supabase Auth
				const { data, error } = await supabase.auth.getUser(token);

				if (error || !data.user) {
					console.log("Erreur Supabase Auth:", error); // Log pour débogage
					return res
						.status(401)
						.json({ message: "Non autorisé, token invalide" });
				}

				const userId = data.user.id;
				const user = await getUserById(userId);

				if (!user) {
					return res.status(401).json({ message: "Utilisateur non trouvé" });
				}

				req.user = user;
				next();
			} catch (supabaseError) {
				console.error("Erreur Supabase:", supabaseError); // Log pour débogage
				return res
					.status(401)
					.json({ message: "Non autorisé, token invalide" });
			}
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(401).json({ message: "Non autorisé, erreur serveur" });
	}
};
