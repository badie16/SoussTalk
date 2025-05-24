import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Intercepteur pour gérer les erreurs de connexion
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Si l'erreur est liée à un problème de réseau, rediriger vers la page d'erreur de connexion
		// mais ne pas supprimer les données d'authentification
		// if (!error.response) {
		// 	console.log(
		// 		"Erreur de connexion détectée, redirection vers la page d'erreur"
		// 	);
		// 	// Stocker l'URL actuelle pour pouvoir y revenir après la reconnexion
		// 	sessionStorage.setItem("lastPath", window.location.pathname);
		// 	window.location.href = "/connection-error";
		// 	// Retourner une promesse rejetée pour éviter que le code continue
		// 	return Promise.reject(new Error("Erreur de connexion réseau"));
		// }
		// return Promise.reject(error);
	}
);

//  Vérifier si l'utilisateur est connecté
export const isLoggedIn = () => {
	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");
	return !!token && !!user;
};

//  Obtenir les infos utilisateur
export const getCurrentUser = () => {
	const user = localStorage.getItem("user");
	return user ? JSON.parse(user) : null;
};

// Improve the login function to handle session management better
export const login = async (formData) => {
	try {
		
		const response = await axios.post(`${API_URL}/api/auth/login`, formData) ;

		// Store the token and user data
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		// Create a new session or reuse existing one
		try {
			// Import dynamically to avoid circular dependency
			const sessionService = await import("./sessionService");
			const sessionResult = await sessionService.createSession(
				response.data.user.id
			);
			if (!sessionResult.success) {
				console.warn("Failed to create session:", sessionResult.message);
			} else {
				console.log(
					"Session created/reused successfully:",
					sessionResult.data?.id
				);
			}
		} catch (error) {
			console.error("Error creating session:", error);
		}

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur login :", error);

		// Si c'est une erreur de connexion réseau, ne pas afficher de message d'erreur spécifique
		// car l'intercepteur va rediriger vers la page d'erreur de connexion
		if (!error.response) {
			return {
				success: false,
				message: "Problème de connexion au serveur",
				isConnectionError: true,
			};
		}

		const message = error.response?.data?.message || "Échec de la connexion";

		return {
			success: false,
			message,
		};
	}
};

//  Déconnexion
export const logout = async () => {
	const token = localStorage.getItem("token");
	const sessionId = localStorage.getItem("sessionId");
	const user = JSON.parse(localStorage.getItem("user") || "{}");

	try {
		// Terminate the current session if it exists
		if (sessionId && user.id) {
			try {
				// Import dynamically to avoid circular dependency
				const sessionService = await import("./sessionService");
				await sessionService.terminateSession(user.id, sessionId);
			} catch (e) {
				console.warn("Failed to terminate session:", e);
			}
		}

		if (token) {
			await axios
				.post(
					`${API_URL}/api/auth/logout`,
					{},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
				.catch((err) => {
					// Ignorer les erreurs de déconnexion côté serveur
					console.warn("Erreur lors de la déconnexion côté serveur:", err);
				});
		}
	} catch (error) {
		console.error("Erreur de déconnexion :", error);
	} finally {
		// Toujours supprimer les données locales
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		localStorage.removeItem("sessionId");
		localStorage.removeItem("sessionCreatedAt");
	}
};

//  Inscription
export const signup = async (userData) => {
	
	try {
		const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
		localStorage.setItem("token", response.data.token);
		localStorage.setItem("user", JSON.stringify(response.data.user));

		return { success: true, data: response.data };
	} catch (error) {
		console.error("Erreur signup :", error.message);

		// Si c'est une erreur de connexion réseau, ne pas afficher de message d'erreur spécifique
		if (!error.response) {
			return {
				success: false,
				message: "Problème de connexion au serveur",
				isConnectionError: true,
			};
		}

		const message = error.response?.data?.message || "Échec de l'inscription";

		return {
			success: false,
			message,
		};
	}
};

//  Mettre à jour le statut en ligne
export const updateOnlineStatus = async (isOnline) => {
	const token = localStorage.getItem("token");
	if (!token) return;

	try {
		await axios.put(
			`${API_URL}/api/users/status`,
			{ online: isOnline },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
	} catch (error) {
		console.error("Erreur statut en ligne :", error);
	}
};

//  Détection automatique de statut en ligne / hors ligne
export const setupOnlineStatusListener = () => {
	window.addEventListener("online", () => updateOnlineStatus(true));
	window.addEventListener("offline", () => updateOnlineStatus(false));
	// Initialiser au chargement
	updateOnlineStatus(navigator.onLine);
};

// Vérifier si le token est valide
export const verifyToken = async () => {
	const token = localStorage.getItem("token");
	if (!token) {
		return { valid: false, message: "Aucun token trouvé" };
	}

	try {
		const response = await axios.get(`${API_URL}/api/users/test-auth`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return { valid: true, user: response.data.user };
	} catch (error) {
		console.error("Erreur vérification token:", error);

		// Si c'est une erreur de connexion réseau, ne pas supprimer les données d'authentification
		if (!error.response) {
			return {
				valid: false,
				message: "Problème de connexion au serveur",
				isConnectionError: true,
			};
		}

		// Si le token est invalide (erreur de serveur), déconnecter l'utilisateur
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		return { valid: false, message: "Token invalide ou expiré" };
	}
};
