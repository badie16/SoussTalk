"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Wifi, WifiOff, CheckCircle, ArrowLeft } from "lucide-react";

export default function ConnectionError() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [isChecking, setIsChecking] = useState(false);
	const [checkComplete, setCheckComplete] = useState(false);
	const [pulseAnimation, setPulseAnimation] = useState(true);
	const [lastPath, setLastPath] = useState("/chat"); // Default path if none is stored

	// Récupérer le chemin précédent depuis sessionStorage
	useEffect(() => {
		const storedPath = sessionStorage.getItem("lastPath");
		if (storedPath) {
			setLastPath(storedPath);
		}
	}, []);

	// Surveiller l'état de la connexion
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Animation de pulsation
		const pulseInterval = setInterval(() => {
			setPulseAnimation((prev) => !prev);
		}, 2000);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
			clearInterval(pulseInterval);
		};
	}, []);

	// Simuler une vérification de connexion
	const checkConnection = () => {
		setIsChecking(true);
		setCheckComplete(false);

		// Tester la connexion en faisant une requête simple
		fetch(`${window.location.origin}/ping`, {
			method: "HEAD",
			cache: "no-store",
			headers: { "Cache-Control": "no-cache" },
		})
			.then(() => {
				setIsOnline(true);
			})
			.catch(() => {
				setIsOnline(navigator.onLine);
			})
			.finally(() => {
				setTimeout(() => {
					setIsChecking(false);
					setCheckComplete(true);

					// Réinitialiser l'état après 3 secondes
					setTimeout(() => {
						setCheckComplete(false);
					}, 3000);
				}, 2000);
			});
	};

	// Retourner à la page précédente
	const returnToPreviousPage = () => {
		window.location.href = lastPath;
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 themed-page">
			<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
				<div className="flex flex-col items-center text-center">
					{/* Icône animée */}
					<div className="relative h-32 w-32 mb-6 flex items-center justify-center">
						<div
							className={`absolute inset-0 bg-red-100 rounded-full ${
								pulseAnimation ? "scale-100 opacity-50" : "scale-90 opacity-30"
							} transition-all duration-1000 ease-in-out`}
						></div>
						<div className="relative z-10">
							{isOnline ? (
								<Wifi size={48} className="text-green-600" />
							) : (
								<WifiOff size={48} className="text-red-500" />
							)}
						</div>
					</div>

					<h1 className="text-2xl font-bold text-gray-800 mb-2">
						{isOnline ? "Connexion rétablie" : "Problème de connexion"}
					</h1>
					<p className="text-gray-600 mb-8">
						{isOnline
							? "Votre connexion Internet semble fonctionner correctement maintenant."
							: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion Internet."}
					</p>

					{/* État de la vérification */}
					{isChecking && (
						<div className="flex items-center justify-center mb-6">
							<div className="w-5 h-5 border-t-2 border-green-500 border-solid rounded-full animate-spin mr-2"></div>
							<span className="text-gray-600">
								Vérification de la connexion...
							</span>
						</div>
					)}

					{checkComplete && (
						<div className="flex items-center justify-center mb-6 text-green-600">
							<CheckCircle size={20} className="mr-2" />
							<span>Vérification terminée</span>
						</div>
					)}

					{/* Boutons d'action */}
					<div className="flex flex-col sm:flex-row gap-4 w-full">
						<button
							onClick={checkConnection}
							disabled={isChecking}
							className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
						>
							<RefreshCw
								size={18}
								className={isChecking ? "animate-spin" : ""}
							/>
							<span>Vérifier la connexion</span>
						</button>
						<button
							onClick={() => window.location.reload()}
							className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
						>
							<RefreshCw size={18} />
							<span>Actualiser la page</span>
						</button>
					</div>

					{/* Bouton pour retourner à la page précédente */}
					{isOnline && (
						<button
							onClick={returnToPreviousPage}
							className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors w-full"
						>
							<ArrowLeft size={18} />
							<span>Retourner à l'application</span>
						</button>
					)}

					{/* Conseils de dépannage */}
					{!isOnline && (
						<div className="mt-8 bg-gray-50 p-4 rounded-lg text-left w-full">
							<h3 className="font-medium text-gray-800 mb-2">
								Conseils de dépannage :
							</h3>
							<ul className="text-gray-600 text-sm space-y-2">
								<li>• Vérifiez votre connexion Wi-Fi ou données mobiles</li>
								<li>• Redémarrez votre routeur ou modem</li>
								<li>• Désactivez votre VPN si vous en utilisez un</li>
								<li>
									• Contactez votre fournisseur d'accès Internet si le problème
									persiste
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
