"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, RefreshCw } from "lucide-react";

export default function NotFound() {
	const [animationComplete, setAnimationComplete] = useState(false);

	useEffect(() => {
		// Déclencher l'animation après le montage du composant
		const timer = setTimeout(() => {
			setAnimationComplete(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4 themed-page">
			<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
				<div className="flex flex-col items-center text-center">
					{/* Animation du numéro 404 */}
					<div className="relative h-40 w-full mb-6 overflow-hidden">
						<div
							className={`text-9xl font-bold text-green-500 opacity-10 absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${
								animationComplete ? "scale-100" : "scale-150"
							}`}
						>
							404
						</div>
						<div
							className={`text-6xl font-bold text-gray-800 absolute inset-0 flex items-center justify-center transition-all duration-1000 delay-300 ${
								animationComplete
									? "translate-y-0 opacity-100"
									: "translate-y-10 opacity-0"
							}`}
						>
							404
						</div>
					</div>

					<h1
						className={`text-2xl font-bold text-gray-800 mb-2 transition-all duration-700 delay-500 ${
							animationComplete
								? "translate-y-0 opacity-100"
								: "translate-y-5 opacity-0"
						}`}
					>
						Page introuvable
					</h1>
					<p
						className={`text-gray-600 mb-8 transition-all duration-700 delay-700 ${
							animationComplete
								? "translate-y-0 opacity-100"
								: "translate-y-5 opacity-0"
						}`}
					>
						Oups ! La page que vous recherchez semble avoir disparu dans
						l'espace numérique.
					</p>

					{/* Boutons d'action */}
					<div
						className={`flex flex-col sm:flex-row gap-4 w-full transition-all duration-700 delay-900 ${
							animationComplete
								? "translate-y-0 opacity-100"
								: "translate-y-5 opacity-0"
						}`}
					>
						<Link
							to="/"
							className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
						>
							<Home size={18} />
							<span>Accueil</span>
						</Link>
						<button
							onClick={() => window.history.back()}
							className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
						>
							<RefreshCw size={18} />
							<span>Retour</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
