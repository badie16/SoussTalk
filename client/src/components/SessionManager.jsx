"use client";

import { useState, useEffect } from "react";
import {
	getUserSessions,
	terminateSession,
	terminateAllSessions,
	getCurrentSessionDuration,
	getSessionStats,
} from "../services/sessionService";
import { formatTimeSince } from "../utils/deviceDetection";
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
} from "lucide-react";
import { useCallback } from "react";
const SessionManager = ({ userId, compact = false }) => {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [stats, setStats] = useState(null);
	const [currentDuration, setCurrentDuration] = useState("");
	const [expandedSession, setExpandedSession] = useState(null);
	const [showStats, setShowStats] = useState(false);

	const currentSessionId = localStorage.getItem("sessionId");

	// Charger les sessions
	useEffect(() => {
	  loadSessions()
	}, [userId])

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

	// Mettre à jour la durée de la session actuelle
	useEffect(() => {
		const updateDuration = () => {
			const duration = getCurrentSessionDuration();
			setCurrentDuration(duration || "");
		};

		updateDuration();
		const interval = setInterval(updateDuration, 1000);

		return () => clearInterval(interval);
	}, []);

	// Gérer la terminaison d'une session
	const handleTerminateSession = async (sessionId) => {
		const loadSessions = async () => {
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
					console.log(
						"Sessions loaded successfully:",
						result.data?.length || 0
					);
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
		};
		if (!userId) return;

		setLoading(true);
		try {
			const result = await terminateSession(userId, sessionId);
			if (result.success) {
				// Recharger les sessions
				await loadSessions();
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
						</div>
					</div>
				)}
			</div>
		);
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
							{sessions.map((session) => (
								<div
									key={session.id}
									className={`p-2 rounded-md ${
										session.id === currentSessionId
											? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
											: "bg-gray-50 dark:bg-gray-800"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											{getDeviceIcon(session)}
											<div className="ml-2">
												<div className="text-sm font-medium text-gray-800 dark:text-gray-200">
													{session.device_name || "Appareil inconnu"}
													{session.id === currentSessionId && " (Actuelle)"}
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

										{session.id !== currentSessionId && (
											<button
												onClick={() => handleTerminateSession(session.id)}
												className="p-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50"
											>
												<LogOut size={12} />
											</button>
										)}
									</div>
								</div>
							))}
						</div>

						{sessions.length > 1 && (
							<button
								onClick={handleTerminateAllSessions}
								className="w-full text-xs py-1 px-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
							>
								Déconnecter les autres sessions
							</button>
						)}
					</>
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
				<button
					onClick={loadSessions}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
					title="Actualiser"
				>
					<RefreshCw size={16} />
				</button>
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
					<div className="flex justify-center py-8">
						<div className="w-8 h-8 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
					</div>
				) : (
					<div className="space-y-4">
						{sessions.length > 0 ? (
							sessions.map((session) => (
								<div
									key={session.id}
									className={`p-4 rounded-lg border ${
										session.id === currentSessionId
											? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
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
							))
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
			</div>
		</div>
	);
};

export default SessionManager;
