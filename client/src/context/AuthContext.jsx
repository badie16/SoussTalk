"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
	login as loginService,
	logout as logoutService,
} from "../services/authService";
import Loading from "../components/Loading";
// Ajouter la gestion des sessions dans AuthContext
// Ajoutez ces imports:
import { terminateSession } from "../services/sessionService";

// Création du contexte - exporter directement ici
export const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error(
			"useAuth doit être utilisé à l'intérieur d'un AuthProvider"
		);
	}
	return context;
};

// Provider du contexte
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Fonction de déconnexion avec useCallback
	const handleLogout = useCallback(async () => {
		setLoading(true);
		try {
			await logoutService();
			setUser(null);
			setToken(null);
			// Dans handleLogout, avant de naviguer vers /login, ajoutez:
			// Terminer la session actuelle
			const sessionId = localStorage.getItem("sessionId");
			if (sessionId) {
				try {
					const user = JSON.parse(localStorage.getItem("user") || "{}");
					if (user.id) {
						await terminateSession(user.id, sessionId);
					}
				} catch (error) {
					console.warn("Erreur lors de la terminaison de la session:", error);
				}
				localStorage.removeItem("sessionId");
			}
			navigate("/login");
		} catch (error) {
			console.error("Erreur de déconnexion:", error);
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	// Vérifier l'authentification au chargement
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Récupérer le token et l'utilisateur du localStorage
				const storedToken = localStorage.getItem("token");
				const storedUser = localStorage.getItem("user");
				const sessionId = localStorage.getItem("sessionId");

				if (storedToken && storedUser) {
					// Vérifier la validité du token avec Supabase
					const { data, error } = await supabase.auth.getSession();

					if (error || !data.session) {
						// Token invalide ou expiré
						console.log("Session expirée ou invalide, déconnexion...");
						await handleLogout();
					} else {
						// Token valide, définir l'utilisateur
						setToken(storedToken);
						setUser(JSON.parse(storedUser));

						// Update session activity if we have a session
						if (sessionId) {
							try {
								// Import dynamically to avoid circular dependency
								const sessionService = await import(
									"../services/sessionService"
								);
								await sessionService.updateSessionActivity(sessionId);
							} catch (error) {
								console.warn("Failed to update session activity:", error);
							}
						}
					}
				}
			} catch (error) {
				console.error(
					"Erreur lors de la vérification de l'authentification:",
					error
				);
				// En cas d'erreur, on déconnecte par sécurité
				await handleLogout();
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [handleLogout]);

	// Fonction de connexion
	const handleLogin = async (credentials) => {
		setLoading(true);
		try {
			const result = await loginService(credentials);			
			if (result.success) {
				setUser(result.data.user);
				setToken(result.data.token);				
				return { success: true };
			} else {
				return { success: false, message: result.message };
			}
		} catch (error) {
			console.error("Erreur de connexion:", error);
			return {
				success: false,
				message:
					error.message || "Une erreur est survenue lors de la connexion",
			};
		} finally {
			setLoading(false);
		}
	};

	// Vérifier si l'utilisateur est authentifié
	const isAuthenticated = () => {
		return !!user && !!token;
	};

	// Valeur du contexte
	const value = {
		user,
		token,
		loading,
		isAuthenticated,
		login: handleLogin,
		logout: handleLogout,
	};

	// Afficher un loader pendant la vérification initiale
	if (loading) {
		return <Loading text="Chargement de votre session..." />;
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
