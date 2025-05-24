"use client";

import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSelector = ({ compact = false }) => {
	const { theme, changeTheme, availableThemes } = useTheme();

	const themeOptions = [
		{
			id: availableThemes.LIGHT,
			name: "Clair",
			icon: <Sun size={compact ? 16 : 20} className="text-yellow-500" />,
			description: "Thème clair pour une utilisation en journée",
		},
		{
			id: availableThemes.DARK,
			name: "Sombre",
			icon: <Moon size={compact ? 16 : 20} className="text-blue-500" />,
			description: "Thème sombre pour réduire la fatigue oculaire",
		},
		{
			id: availableThemes.SYSTEM,
			name: "Système",
			icon: <Monitor size={compact ? 16 : 20} className="text-gray-500" />,
			description: "Suit les préférences de votre système",
		},
	];

	if (compact) {
		return (
			<div className="flex space-x-2">
				{themeOptions.map((option) => (
					<button
						key={option.id}
						onClick={() => changeTheme(option.id)}
						className={`p-2 rounded-md flex items-center justify-center ${
							theme === option.id
								? "bg-green-600 text-white"
								: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
						}`}
						title={option.name}
					>
						{option.icon}
					</button>
				))}
			</div>
		);
	}

	return (
		<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
			<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
				Apparence
			</h3>

			<div>
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
					Thème
				</label>
				<div className="grid grid-cols-3 gap-2">
					{themeOptions.map((option) => (
						<button
							key={option.id}
							onClick={() => changeTheme(option.id)}
							className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${
								theme === option.id
									? "bg-green-600 text-white"
									: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
							}`}
						>
							{option.icon}
							<span className="text-sm">{option.name}</span>
						</button>
					))}
				</div>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					{themeOptions.find((option) => option.id === theme)?.description}
				</p>
			</div>
		</div>
	);
};

export default ThemeSelector;
