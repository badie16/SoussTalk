"use client";

import { useState, useEffect } from "react";
import {
	getUserSessions,
	terminateSession,
	terminateAllSessions,
	getSessionStats,
	getSessionHistory,
	markSessionAsTrusted,
} from "../services/sessionService";
import sessionService from "../services/sessionService"; // Import the default export
import { formatTimeSince } from "../utils/deviceDetection";
import Loading from "./Loading";
import {
	LogOut,
	AlertTriangle,
	Shield,
	Clock,
	MapPin,
	Monitor,
	Smartphone,
	Tablet,
	RefreshCw,
	ChevronDown,
	ChevronUp,
	Info,
	CheckCircle,
	History,
	X,
	Calendar,
} from "lucide-react";
import { useCallback } from "react";
import messageService from "../services/messageService";

const SessionManager = ({ userId, compact = false }) => {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState(null);
	const [currentDuration, setCurrentDuration] = useState("");
	const [expandedSession, setExpandedSession] = useState(null);
	const [showStats, setShowStats] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [sessionHistory, setSessionHistory] = useState([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	const currentSessionId = localStorage.getItem("sessionId");

	// Écouter les événements de session terminée
	useEffect(() => {
		if (messageService.socket) {
			messageService.socket.on("session_terminated", handleSessionTerminated);
		}

		return () => {
			if (messageService.socket) {
				messageService.socket.off(
					"session_terminated",
					handleSessionTerminated
				);
			}
		};
	}, []);

	const handleSessionTerminated = (data) => {
		if (data.sessionId === currentSessionId) {
			// Cette session a été terminée, déconnecter l'utilisateur
			alert(data.message);

			// Nettoyer le localStorage
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			localStorage.removeItem("sessionId");
			localStorage.removeItem("sessionCreatedAt");

			// Rediriger vers la page de connexion
			window.location.href = "/login";
		} else {
			// Une autre session a été terminée, recharger la liste
			loadSessions();
		}
	};

	// Charger les sessions
	useEffect(() => {
		loadSessions();
	}, [userId]);

	const loadSessions = useCallback(async () => {
		if (!userId) {
			console.warn("No userId provided to SessionManager");
			return;
		}

		setLoading(true);
		setError("");

		try {
			console.log("Attempting to load sessions for user:", userId);
			const result = await getUserSessions(userId);

			if (result.success) {
				console.log("Sessions loaded successfully:", result.data?.length || 0);
				setSessions(result.data || []);
			} else {
				console.error("Failed to load sessions:", result.message);
				setError(result.message || "Impossible de charger les sessions");
			}

			// Load stats
			try {
				console.log("Attempting to load session stats");
				const statsResult = await getSessionStats(userId);
				if (statsResult.success) {
					console.log("Stats loaded successfully:", statsResult.data);
					setStats(statsResult.data);
				} else {
					console.warn("Failed to load stats:", statsResult.message);
				}
			} catch (statsError) {
				console.error("Error loading stats:", statsError);
			}
		} catch (error) {
			console.error("Unexpected error loading sessions:", error);
			setError("Erreur lors du chargement des sessions");
		} finally {
			setLoading(false);
		}
	}, [userId]);

	// Charger l'historique des sessions
	const loadSessionHistory = useCallback(async () => {
		if (!userId) {
			console.warn("No userId provided to load session history");
			return;
		}

		setLoadingHistory(true);
		setError("");

		try {
			console.log("Attempting to load session history for user:", userId);
			const result = await getSessionHistory(userId);

			if (result.success) {
				console.log(
					"Session history loaded successfully:",
					result.data?.length || 0
				);
				setSessionHistory(result.data || []);
				setShowHistory(true);
			} else {
				console.error("Failed to load session history:", result.message);
				setError(
					result.message || "Impossible de charger l'historique des sessions"
				);
			}
		} catch (error) {
			console.error("Unexpected error loading session history:", error);
			setError("Erreur lors du chargement de l'historique des sessions");
		} finally {
			setLoadingHistory(false);
		}
	}, [userId]);

	// Mettre à jour la durée de la session actuelle
	useEffect(() => {
		const updateDuration = () => {
			const duration = sessionService.getCurrentSessionDuration(); // Use the imported default export
			setCurrentDuration(duration || "");
		};

		updateDuration();
		const interval = setInterval(updateDuration, 1000);

		return () => clearInterval(interval);
	}, []);

	// Gérer la terminaison d'une session
	const handleTerminateSession = async (sessionId) => {
		if (!userId) return;

		setLoading(true);
		try {
			const result = await terminateSession(userId, sessionId);
			if (result.success) {
				// Recharger les sessions
				await loadSessions();
				// Si l'historique est affiché, le recharger aussi
				if (showHistory) {
					await loadSessionHistory();
				}
			} else {
				setError(result.message || "Impossible de terminer la session");
			}
		} catch (error) {
			console.error("Erreur lors de la terminaison de la session:", error);
			setError("Erreur lors de la terminaison de la session");
		} finally {
			setLoading(false);
		}
	};

	// Gérer la terminaison de toutes les sessions
	const handleTerminateAllSessions = async () => {
		if (!userId) return;

		setLoading(true);
		try {
			const result = await terminateAllSessions(userId);
			if (result.success) {
				// Recharger les sessions
				await loadSessions();
				// Si l'historique est affiché, le recharger aussi
				if (showHistory) {
					await loadSessionHistory();
				}
			} else {
				setError(result.message || "Impossible de terminer les sessions");
			}
		} catch (error) {
			console.error("Erreur lors de la terminaison des sessions:", error);
			setError("Erreur lors de la terminaison des sessions");
		} finally {
			setLoading(false);
		}
	};

	// Marquer une session comme fiable (non suspecte) - SÉCURISÉ
	const handleTrustSession = async (sessionId) => {
		if (!userId) return;

		// Vérifier que c'est bien la session de l'utilisateur actuel
		const session = sessions.find((s) => s.id === sessionId);
		if (!session || session.user_id !== userId) {
			setError("Vous ne pouvez marquer comme fiable que vos propres sessions");
			return;
		}

		setLoading(true);
		try {
			const result = await markSessionAsTrusted(sessionId);
			if (result.success) {
				// Recharger les sessions
				await loadSessions();
			} else {
				setError(
					result.message || "Impossible de marquer la session comme fiable"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors du marquage de la session comme fiable:",
				error
			);
			setError("Erreur lors du marquage de la session comme fiable");
		} finally {
			setLoading(false);
		}
	};

	// Afficher l'icône appropriée pour le type d'appareil
	const getDeviceIcon = (session) => {
		if (session.device_type === "Mobile") {
			return <Smartphone size={compact ? 16 : 20} className="text-blue-500" />;
		} else if (session.device_type === "Tablet") {
			return <Tablet size={compact ? 16 : 20} className="text-purple-500" />;
		} else {
			return <Monitor size={compact ? 16 : 20} className="text-green-500" />;
		}
	};

	// Afficher les détails d'une session
	const renderSessionDetails = (session) => {
		const isOwnSession = session.user_id === userId;

		return (
			<div className="mt-2 pl-10 space-y-2 text-sm text-gray-600 dark:text-gray-400">
				{session.browser_name && (
					<div className="flex items-center">
						<span className="font-medium mr-2">Navigateur:</span>
						<span>
							{session.browser_name} {session.browser_version}
						</span>
					</div>
				)}

				{session.os_name && (
					<div className="flex items-center">
						<span className="font-medium mr-2">Système:</span>
						<span>
							{session.os_name} {session.os_version}
						</span>
					</div>
				)}

				{session.location && (
					<div className="flex items-center">
						<MapPin size={14} className="mr-1 text-red-500" />
						<span>{session.location}</span>
					</div>
				)}

				{session.screen_resolution && (
					<div className="flex items-center">
						<span className="font-medium mr-2">Écran:</span>
						<span>{session.screen_resolution}</span>
					</div>
				)}

				<div className="flex items-center">
					<Clock size={14} className="mr-1 text-gray-500" />
					<span>Créée {formatTimeSince(session.created_at)}</span>
				</div>

				{session.is_suspicious && (
					<div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex items-start">
						<AlertTriangle
							size={16}
							className="mr-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
						/>
						<div>
							<p className="font-medium text-yellow-700 dark:text-yellow-400">
								Connexion inhabituelle
							</p>
							<p className="text-yellow-600 dark:text-yellow-300 text-xs">
								{session.suspicious_reasons ||
									"Cette session provient d'un nouvel appareil ou d'un nouvel emplacement."}
							</p>
							{isOwnSession && (
								<button
									onClick={() => handleTrustSession(session.id)}
									className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50 flex items-center"
								>
									<CheckCircle size={12} className="mr-1" />
									C'est moi, marquer comme fiable
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		);
	};

	// Afficher les détails d'une session historique
	const renderHistorySessionDetails = (session) => {
		return (
			<div className="mt-2 pl-10 space-y-2 text-sm text-gray-600 dark:text-gray-400">
				{session.browser_name && (
					<div className="flex items-center">
						<span className="font-medium mr-2">Navigateur:</span>
						<span>
							{session.browser_name} {session.browser_version}
						</span>
					</div>
				)}

				{session.os_name && (
					<div className="flex items-center">
						<span className="font-medium mr-2">Système:</span>
						<span>
							{session.os_name} {session.os_version}
						</span>
					</div>
				)}

				{session.location && (
					<div className="flex items-center">
						<MapPin size={14} className="mr-1 text-red-500" />
						<span>{session.location}</span>
					</div>
				)}

				<div className="flex items-center">
					<Calendar size={14} className="mr-1 text-gray-500" />
					<span>
						Créée le {new Date(session.created_at).toLocaleDateString()}
					</span>
				</div>

				{session.ended_at && (
					<div className="flex items-center">
						<Clock size={14} className="mr-1 text-gray-500" />
						<span>
							Terminée le {new Date(session.ended_at).toLocaleDateString()} à{" "}
							{new Date(session.ended_at).toLocaleTimeString()}
						</span>
					</div>
				)}

				{session.is_suspicious && (
					<div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex items-start">
						<AlertTriangle
							size={16}
							className="mr-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
						/>
						<div>
							<p className="font-medium text-yellow-700 dark:text-yellow-400">
								Connexion inhabituelle
							</p>
							<p className="text-yellow-600 dark:text-yellow-300 text-xs">
								{session.suspicious_reasons ||
									"Cette session provenait d'un nouvel appareil ou d'un nouvel emplacement."}
							</p>
						</div>
					</div>
				)}
			</div>
		);
	};

	// Add a new function to handle logout of current session
	const handleLogoutCurrentSession = async () => {
		if (!userId) return;

		const currentSessionId = localStorage.getItem("sessionId");
		if (!currentSessionId) return;

		setLoading(true);
		try {
			const result = await terminateSession(userId, currentSessionId);
			if (result.success) {
				// Clear local storage and redirect to login
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				localStorage.removeItem("sessionId");
				localStorage.removeItem("sessionCreatedAt");

				// Redirect to login page
				window.location.href = "/login";
			} else {
				setError(result.message || "Impossible de terminer la session");
			}
		} catch (error) {
			console.error("Erreur lors de la terminaison de la session:", error);
			setError("Erreur lors de la terminaison de la session");
		} finally {
			setLoading(false);
		}
	};

	// Version compacte pour l'intégration dans d'autres composants
	if (compact) {
		return (
			<div className="space-y-3">
				{error && (
					<div className="text-sm text-red-600 dark:text-red-400">{error}</div>
				)}

				{loading ? (
					<div className="flex justify-center py-2">
						<div className="w-5 h-5 border-t-2 border-green-500 border-solid rounded-full animate-spin"></div>
					</div>
				) : (
					<>
						<div className="flex justify-between items-center">
							<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Sessions actives ({sessions.length})
							</h4>
							<button
								onClick={loadSessions}
								className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
							>
								<RefreshCw size={14} />
							</button>
						</div>

						<div className="space-y-2 max-h-60 overflow-y-auto pr-1">
							{sessions.map((session) => {
								const isOwnSession = session.user_id === userId;

								return (
									<div
										key={session.id}
										className={`p-2 rounded-md ${
											session.id === currentSessionId
												? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
												: session.is_suspicious
												? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
												: "bg-gray-50 dark:bg-gray-800"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												{getDeviceIcon(session)}
												<div className="ml-2">
													<div className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
														{session.device_name || "Appareil inconnu"}
														{session.id === currentSessionId && " (Actuelle)"}
														{session.is_suspicious && (
															<AlertTriangle
																size={14}
																className="ml-1 text-yellow-500"
															/>
														)}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
														<Clock size={10} className="mr-1" />
														{session.id === currentSessionId
															? `Durée: ${currentDuration}`
															: `Dernière activité: ${formatTimeSince(
																	session.last_active
															  )}`}
													</div>
												</div>
											</div>

											<div className="flex">
												{session.is_suspicious && isOwnSession && (
													<button
														onClick={() => handleTrustSession(session.id)}
														className="p-1 mr-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50"
														title="Marquer comme fiable"
													>
														<CheckCircle size={12} />
													</button>
												)}
												{session.id !== currentSessionId && (
													<button
														onClick={() => handleTerminateSession(session.id)}
														className="p-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
														title="Déconnecter"
													>
														<LogOut size={12} />
													</button>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{sessions.length > 1 && (
							<button
								onClick={handleTerminateAllSessions}
								className="w-full text-xs py-1 px-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
							>
								Déconnecter les autres sessions
							</button>
						)}
						<button
							onClick={handleLogoutCurrentSession}
							className="w-full mt-2 text-xs py-1 px-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 dark:bg-gray-800 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50"
						>
							Se déconnecter (session actuelle)
						</button>
						<button
							onClick={loadSessionHistory}
							className="w-full mt-2 text-xs py-1 px-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50 flex items-center justify-center"
						>
							<History size={12} className="mr-1" />
							Voir l'historique des sessions
						</button>
					</>
				)}

				{/* Session History Modal for Compact View */}
				{showHistory && (
					<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
							<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
									Historique des sessions
								</h3>
								<button
									onClick={() => setShowHistory(false)}
									className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
								>
									<X size={20} />
								</button>
							</div>
							<div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
								{loadingHistory ? (
									<div className="flex justify-center py-4">
										<div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
									</div>
								) : sessionHistory.length > 0 ? (
									<div className="space-y-3">
										{sessionHistory.map((session) => (
											<div
												key={session.id}
												className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center">
														{getDeviceIcon(session)}
														<div className="ml-2">
															<div className="text-sm font-medium text-gray-800 dark:text-gray-200">
																{session.device_name || "Appareil inconnu"}
																{session.is_suspicious && (
																	<span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full dark:bg-yellow-900 dark:text-yellow-300">
																		Suspect
																	</span>
																)}
															</div>
															<div className="text-xs text-gray-500 dark:text-gray-400">
																{formatTimeSince(
																	session.ended_at || session.last_active
																)}
															</div>
														</div>
													</div>
													<button
														onClick={() =>
															setExpandedSession(
																expandedSession === session.id
																	? null
																	: session.id
															)
														}
														className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
													>
														<Info size={16} />
													</button>
												</div>
												{expandedSession === session.id &&
													renderHistorySessionDetails(session)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-6 text-gray-500 dark:text-gray-400">
										Aucune session inactive trouvée
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Version complète
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
					Sessions actives
				</h2>
				<div className="flex items-center">
					<button
						onClick={loadSessionHistory}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400 mr-2"
						title="Historique des sessions"
					>
						<History size={16} />
					</button>
					<button
						onClick={loadSessions}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
						title="Actualiser"
					>
						<RefreshCw size={16} />
					</button>
				</div>
			</div>

			<div className="px-6 py-4">
				{error && (
					<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
						<span>{error}</span>
					</div>
				)}
				{/* Statistiques des sessions */}
				<div className="mb-4">
					<button
						onClick={() => setShowStats(!showStats)}
						className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
					>
						<div className="flex items-center">
							<Shield size={18} className="mr-2 text-green-500" />
							<span className="font-medium text-gray-800 dark:text-gray-200">
								Statistiques de sécurité
							</span>
						</div>
						{showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</button>

					{showStats && stats && (
						<div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Sessions actives
									</div>
									<div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
										{stats.activeSessions}
									</div>
								</div>

								<div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Dernière connexion
									</div>
									<div className="text-lg font-medium text-gray-800 dark:text-gray-200">
										{formatTimeSince(stats.lastLogin)}
									</div>
								</div>

								<div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Appareils uniques
									</div>
									<div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
										{stats.uniqueDevices}
									</div>
								</div>

								<div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
									<div className="text-sm text-gray-500 dark:text-gray-400">
										Connexions suspectes
									</div>
									<div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
										{stats.suspiciousLogins || 0}
									</div>
								</div>
							</div>

							{stats.suspiciousLogins > 0 && (
								<div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
									<div className="flex items-start">
										<AlertTriangle
											size={18}
											className="text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"
										/>
										<div>
											<p className="font-medium text-yellow-800 dark:text-yellow-300">
												Activité inhabituelle détectée
											</p>
											<p className="text-sm text-yellow-700 dark:text-yellow-400">
												Nous avons détecté des connexions depuis de nouveaux
												emplacements ou appareils. Vérifiez vos sessions actives
												et déconnectez celles que vous ne reconnaissez pas.
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{loading ? (
					<Loading fullScreen={false}></Loading>
				) : (
					<div className="space-y-4">
						{sessions.length > 0 ? (
							sessions.map((session) => {
								const isOwnSession = session.user_id === userId;

								return (
									<div
										key={session.id}
										className={`p-4 rounded-lg border ${
											session.id === currentSessionId
												? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
												: session.is_suspicious
												? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
												: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center">
												<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
													{getDeviceIcon(session)}
												</div>
												<div>
													<div className="flex items-center">
														<p className="font-medium text-gray-800 dark:text-gray-200">
															{session.device_name || "Appareil inconnu"}
															{session.id === currentSessionId &&
																" (Session actuelle)"}
														</p>
														{session.is_suspicious && (
															<span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full dark:bg-yellow-900 dark:text-yellow-300">
																Nouvelle connexion
															</span>
														)}
													</div>
													<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
														<Clock size={14} className="mr-1" />
														{session.id === currentSessionId
															? `Durée de session: ${currentDuration}`
															: `Dernière activité: ${formatTimeSince(
																	session.last_active
															  )}`}

														{session.location && (
															<>
																<span className="mx-2">•</span>
																<MapPin size={14} className="mr-1" />
																<span>{session.location}</span>
															</>
														)}
													</div>
												</div>
											</div>

											<div className="flex items-center">
												{session.is_suspicious && isOwnSession && (
													<button
														onClick={() => handleTrustSession(session.id)}
														className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 mr-2"
														title="Marquer comme fiable"
													>
														<CheckCircle size={18} />
													</button>
												)}
												<button
													onClick={() =>
														setExpandedSession(
															expandedSession === session.id ? null : session.id
														)
													}
													className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 mr-2"
													title="Détails"
												>
													<Info size={18} />
												</button>

												{session.id !== currentSessionId && (
													<button
														onClick={() => handleTerminateSession(session.id)}
														className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
													>
														Déconnecter
													</button>
												)}
											</div>
										</div>

										{expandedSession === session.id &&
											renderSessionDetails(session)}
									</div>
								);
							})
						) : (
							<div className="text-center py-8 text-gray-500 dark:text-gray-400">
								Aucune session active trouvée
							</div>
						)}
					</div>
				)}

				{sessions.length > 1 && (
					<div className="mt-6">
						<button
							onClick={handleTerminateAllSessions}
							disabled={loading}
							className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
						>
							<LogOut size={16} className="mr-2" />
							Se déconnecter de toutes les autres sessions
						</button>
					</div>
				)}
				<div className="mt-3">
					<button
						onClick={handleLogoutCurrentSession}
						disabled={loading}
						className="w-full flex justify-center items-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/50 disabled:opacity-50"
					>
						<LogOut size={16} className="mr-2" />
						Se déconnecter (session actuelle)
					</button>
				</div>
				<div className="mt-3">
					<button
						onClick={loadSessionHistory}
						disabled={loading || loadingHistory}
						className="w-full flex justify-center items-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50 disabled:opacity-50"
					>
						<History size={16} className="mr-2" />
						Voir l'historique des sessions
					</button>
				</div>
			</div>

			{/* Session History Modal */}
			{showHistory && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
								Historique des sessions
							</h3>
							<button
								onClick={() => setShowHistory(false)}
								className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
							>
								<X size={20} />
							</button>
						</div>
						<div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
							{loadingHistory ? (
								<div className="flex justify-center py-8">
									<div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
								</div>
							) : sessionHistory.length > 0 ? (
								<div className="space-y-4">
									{sessionHistory.map((session) => (
										<div
											key={session.id}
											className={`p-4 rounded-lg border ${
												session.is_suspicious
													? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
													: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
														{getDeviceIcon(session)}
													</div>
													<div>
														<div className="flex items-center">
															<p className="font-medium text-gray-800 dark:text-gray-200">
																{session.device_name || "Appareil inconnu"}
															</p>
															{session.is_suspicious && (
																<span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full dark:bg-yellow-900 dark:text-yellow-300">
																	Connexion suspecte
																</span>
															)}
														</div>
														<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
															<Calendar size={14} className="mr-1" />
															<span>
																{new Date(
																	session.created_at
																).toLocaleDateString()}{" "}
																-
																{session.ended_at
																	? new Date(
																			session.ended_at
																	  ).toLocaleDateString()
																	: "Non terminée"}
															</span>
														</div>
													</div>
												</div>

												<button
													onClick={() =>
														setExpandedSession(
															expandedSession === session.id ? null : session.id
														)
													}
													className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
													title="Détails"
												>
													<Info size={18} />
												</button>
											</div>

											{expandedSession === session.id &&
												renderHistorySessionDetails(session)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12 text-gray-500 dark:text-gray-400">
									Aucune session inactive trouvée
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SessionManager;
