"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { updateUserPreferences } from "../services/userService";

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

// Créez le contexte avec une valeur par défaut plus robuste
export const ThemeContext = createContext({
  theme: THEMES.SYSTEM,
  isDarkMode: false,
  changeTheme: () => {},
  availableThemes: THEMES,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialisation du thème
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      setTheme(savedTheme || THEMES.SYSTEM);
    }
  }, []);

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
