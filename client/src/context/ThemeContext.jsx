"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { updateUserPreferences } from "../services/userService";

// Définition des thèmes disponibles
export const THEMES = {
	LIGHT: "light",
	DARK: "dark",
	SYSTEM: "system",
};

// Création du contexte
export const ThemeContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error(
			"useTheme doit être utilisé à l'intérieur d'un ThemeProvider"
		);
	}
	return context;
};

// Provider du contexte
export const ThemeProvider = ({ children }) => {
	// État pour le thème actuel
	const [theme, setTheme] = useState(() => {
		// Récupérer le thème depuis localStorage ou utiliser "system" par défaut
		if (typeof window !== "undefined") {
			const savedTheme = localStorage.getItem("theme");
			return savedTheme || THEMES.SYSTEM;
		}
		return THEMES.SYSTEM;
	});

	// État pour savoir si le mode sombre est actif
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Fonction pour changer le thème
	const changeTheme = (newTheme) => {
		setTheme(newTheme);
		if (typeof window !== "undefined") {
			localStorage.setItem("theme", newTheme);
		}

		// Mettre à jour les préférences utilisateur si l'utilisateur est connecté
		const user = localStorage.getItem("user");
		if (user) {
			try {
				const userData = JSON.parse(user);
				const userId = userData.id;

				// Récupérer les préférences actuelles
				const currentPreferences = userData.preferences || {};

				// Mettre à jour les préférences dans la base de données
				updateUserPreferences(userId, {
					...currentPreferences,
					theme: newTheme,
				}).catch((error) => {
					console.error(
						"Erreur lors de la mise à jour des préférences de thème:",
						error
					);
				});
			} catch (error) {
				console.error(
					"Erreur lors de la mise à jour des préférences de thème:",
					error
				);
			}
		}
	};

	// Effet pour appliquer le thème
	useEffect(() => {
		const applyTheme = () => {
			if (typeof window === "undefined") return;

			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;

			// Déterminer si le mode sombre doit être activé
			const shouldBeDark =
				theme === THEMES.DARK || (theme === THEMES.SYSTEM && prefersDark);

			// Mettre à jour l'état
			setIsDarkMode(shouldBeDark);

			// Appliquer la classe dark au document
			if (shouldBeDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}

			// Appliquer la classe de thème spécifique
			document.documentElement.classList.remove("theme-light", "theme-dark");
			document.documentElement.classList.add(
				`theme-${shouldBeDark ? "dark" : "light"}`
			);
		};

		// Appliquer le thème immédiatement
		applyTheme();

		// Écouter les changements de préférence système
		if (typeof window !== "undefined") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleChange = () => {
				if (theme === THEMES.SYSTEM) {
					applyTheme();
				}
			};

			// Ajouter l'écouteur d'événement
			mediaQuery.addEventListener("change", handleChange);

			// Nettoyer l'écouteur d'événement
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
	}, [theme]);

	// Valeur du contexte
	const value = {
		theme,
		isDarkMode,
		changeTheme,
		availableThemes: THEMES,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export default ThemeContext;
