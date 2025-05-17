const sessionService = require("../services/sessionService");

// Get user sessions
const getUserSessions = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if the user is requesting their own sessions or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		const sessions = await sessionService.getActiveSessions(id);
		console.log(`Retrieved ${sessions.length} sessions for user ${id}`);
		res.status(200).json(sessions);
	} catch (error) {
		console.error("Error retrieving sessions:", error);
		res
			.status(500)
			.json({ message: "Erreur serveur lors de la récupération des sessions" });
	}
};

// Get user session history (inactive sessions)
const getSessionHistory = async (req, res) => {
	try {
		const { id } = req.params;
		const limit = req.query.limit ? Number.parseInt(req.query.limit) : 20;

		// Check if the user is requesting their own sessions or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		const sessions = await sessionService.getInactiveSessions(id, limit);
		console.log(
			`Retrieved ${sessions.length} inactive sessions for user ${id}`
		);
		res.status(200).json(sessions);
	} catch (error) {
		console.error("Error retrieving session history:", error);
		res
			.status(500)
			.json({
				message:
					"Erreur serveur lors de la récupération de l'historique des sessions",
			});
	}
};

// Create a new session
const createUserSession = async (req, res) => {
	try {
		const { id } = req.params;
		const { deviceInfo } = req.body;

		console.log(`Creating session for user ${id}`);
		console.log("Device info:", deviceInfo);

		// Check if the user is creating their own session or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		// Add IP address
		const ipAddress =
			req.headers["x-forwarded-for"] || req.socket.remoteAddress;

		// Enrich device information
		const sessionData = {
			...deviceInfo,
			ipAddress,
		};

		const session = await sessionService.createSession(id, sessionData);
		console.log(`Session created successfully with ID: ${session.id}`);
		res.status(201).json(session);
	} catch (error) {
		// More specific error responses
		if (error.message === "User not found") {
			return res.status(404).json({ message: "Utilisateur non trouvé" });
		}
		if (error.message === "User ID required") {
			return res.status(400).json({ message: "ID utilisateur requis" });
		}
		res
			.status(500)
			.json({ message: "Erreur serveur lors de la création de la session" });
	}
};

// Mark a session as trusted (not suspicious)
const markSessionAsTrusted = async (req, res) => {
	try {
		const { sessionId } = req.params;
		console.log(`Marking session ${sessionId} as trusted`);

		// Get the session to check ownership
		const session = await sessionService.getSessionById(sessionId);

		if (!session) {
			return res.status(404).json({ message: "Session non trouvée" });
		}

		// Check if the user is managing their own session or is admin
		if (req.user.id !== session.user_id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		await sessionService.markSessionAsTrusted(sessionId);
		console.log(`Session ${sessionId} marked as trusted successfully`);
		res
			.status(200)
			.json({ message: "Session marquée comme fiable avec succès" });
	} catch (error) {
		console.error("Error marking session as trusted:", error);

		// More specific error responses
		if (error.message === "Session not found") {
			return res.status(404).json({ message: "Session non trouvée" });
		}

		if (error.message === "Session ID required") {
			return res.status(400).json({ message: "ID de session requis" });
		}

		res
			.status(500)
			.json({
				message: "Erreur serveur lors du marquage de la session comme fiable",
			});
	}
};

// Terminate a session
const terminateUserSession = async (req, res) => {
	try {
		const { id, sessionId } = req.params;
		console.log(`Terminating session ${sessionId} for user ${id}`);

		// Check if the user is terminating their own session or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		await sessionService.terminateSession(sessionId);
		console.log(`Session ${sessionId} terminated successfully`);
		res.status(200).json({ message: "Session terminée avec succès" });
	} catch (error) {
		console.error("Error terminating session:", error);

		// More specific error responses
		if (error.message === "Session not found") {
			return res.status(404).json({ message: "Session non trouvée" });
		}

		if (error.message === "Session ID required") {
			return res.status(400).json({ message: "ID de session requis" });
		}

		res
			.status(500)
			.json({ message: "Erreur serveur lors de la terminaison de la session" });
	}
};

// Terminate all sessions
const terminateAllUserSessions = async (req, res) => {
	try {
		const { id } = req.params;
		const { currentSessionId } = req.body;
		console.log(
			`Terminating all sessions for user ${id} except ${currentSessionId}`
		);

		// Check if the user is terminating their own sessions or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		await sessionService.terminateAllSessions(id, currentSessionId);
		console.log(`All sessions terminated successfully for user ${id}`);
		res
			.status(200)
			.json({ message: "Toutes les sessions ont été terminées avec succès" });
	} catch (error) {
		console.error("Error terminating all sessions:", error);

		// More specific error responses
		if (error.message === "User ID required") {
			return res.status(400).json({ message: "ID utilisateur requis" });
		}

		res
			.status(500)
			.json({ message: "Erreur serveur lors de la terminaison des sessions" });
	}
};

// Update session activity
const updateSessionActivity = async (req, res) => {
	try {
		const { sessionId } = req.params;
		console.log(`Updating activity for session ${sessionId}`);

		await sessionService.updateSessionActivity(sessionId);
		res.status(200).json({ message: "Activité de session mise à jour" });
	} catch (error) {
		console.error("Error updating session activity:", error);

		// More specific error responses
		if (error.message === "Session not found") {
			return res.status(404).json({ message: "Session non trouvée" });
		}

		if (error.message === "Session ID required") {
			return res.status(400).json({ message: "ID de session requis" });
		}

		res
			.status(500)
			.json({ message: "Erreur serveur lors de la mise à jour de l'activité" });
	}
};

// Get session statistics
const getSessionStats = async (req, res) => {
	try {
		const { id } = req.params;
		console.log(`Getting session stats for user ${id}`);

		// Check if the user is requesting their own stats or is admin
		if (req.user.id !== id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		const stats = await sessionService.getSessionStats(id);
		console.log(`Session stats retrieved for user ${id}`);
		res.status(200).json(stats);
	} catch (error) {
		console.error("Error retrieving session stats:", error);

		// More specific error responses
		if (error.message === "User ID required") {
			return res.status(400).json({ message: "ID utilisateur requis" });
		}

		res.status(500).json({
			message: "Erreur serveur lors de la récupération des statistiques",
		});
	}
};

// Check if a session is suspicious
const checkSessionSecurity = async (req, res) => {
	try {
		const { sessionId } = req.params;
		console.log(`Checking security for session ${sessionId}`);

		// Get the session
		const session = await sessionService.getSessionById(sessionId);

		if (!session) {
			return res.status(404).json({ message: "Session non trouvée" });
		}

		// Check if the user is checking their own session or is admin
		if (req.user.id !== session.user_id && req.user.role !== "admin") {
			return res.status(403).json({ message: "Accès non autorisé" });
		}

		res.status(200).json({
			isSuspicious: session.is_suspicious,
			reasons: session.suspicious_reasons,
		});
	} catch (error) {
		console.error("Error checking session security:", error);
		res
			.status(500)
			.json({ message: "Erreur serveur lors de la vérification de sécurité" });
	}
};

module.exports = {
	getUserSessions,
	getSessionHistory,
	createUserSession,
	terminateUserSession,
	terminateAllUserSessions,
	updateSessionActivity,
	getSessionStats,
	checkSessionSecurity,
	markSessionAsTrusted,
};
