"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
	// État pour le thème actuel (light, dark, system)
	const [theme, setTheme] = useState(() => {
		// Récupérer le thème depuis localStorage ou utiliser "system" par défaut
		const savedTheme = localStorage.getItem("theme");
		return savedTheme || "system";
	});

	// État pour savoir si le mode sombre est actif
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Fonction pour changer le thème
	const changeTheme = (newTheme) => {
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	// Effet pour appliquer le thème
	useEffect(() => {
		const applyTheme = () => {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;

			// Déterminer si le mode sombre doit être activé
			const shouldBeDark =
				theme === "dark" || (theme === "system" && prefersDark);

			// Mettre à jour l'état
			setIsDarkMode(shouldBeDark);

			// Appliquer la classe dark au document
			if (shouldBeDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		};

		// Appliquer le thème immédiatement
		applyTheme();

		// Écouter les changements de préférence système
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				applyTheme();
			}
		};

		// Ajouter l'écouteur d'événement
		mediaQuery.addEventListener("change", handleChange);

		// Nettoyer l'écouteur d'événement
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	// Valeur du contexte
	const value = {
		theme,
		isDarkMode,
		changeTheme,
	};

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
};

export default ThemeContext;
