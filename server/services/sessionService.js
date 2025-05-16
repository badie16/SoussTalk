const supabase = require("../config/supabase");

// Créer une nouvelle session
const createSession = async (userId, deviceInfo) => {
	try {
		const sessionData = {
			user_id: userId,
			device_name: deviceInfo.deviceName || "Appareil inconnu",
			device_type: deviceInfo.deviceType || "Navigateur",
			ip_address: deviceInfo.ipAddress || "",
			user_agent: deviceInfo.userAgent || "",
			last_active: new Date().toISOString(),
			is_active: true,
		};

		const { data, error } = await supabase
			.from("sessions")
			.insert([sessionData])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error("Erreur lors de la création de la session:", error);
		throw error;
	}
};

// Récupérer toutes les sessions actives d'un utilisateur
const getActiveSessions = async (userId) => {
	try {
		const { data, error } = await supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.eq("is_active", true)
			.order("last_active", { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error("Erreur lors de la récupération des sessions:", error);
		throw error;
	}
};

// Mettre à jour la dernière activité d'une session
const updateSessionActivity = async (sessionId) => {
	try {
		const { error } = await supabase
			.from("sessions")
			.update({ last_active: new Date().toISOString() })
			.eq("id", sessionId);

		if (error) throw error;
		return true;
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de l'activité de la session:",
			error
		);
		throw error;
	}
};

// Terminer une session spécifique
const terminateSession = async (sessionId) => {
	try {
		const { error } = await supabase
			.from("sessions")
			.update({ is_active: false, ended_at: new Date().toISOString() })
			.eq("id", sessionId);

		if (error) throw error;
		return true;
	} catch (error) {
		console.error("Erreur lors de la terminaison de la session:", error);
		throw error;
	}
};

// Terminer toutes les sessions d'un utilisateur (sauf la session courante)
const terminateAllSessions = async (userId, currentSessionId = null) => {
	try {
		let query = supabase
			.from("sessions")
			.update({ is_active: false, ended_at: new Date().toISOString() })
			.eq("user_id", userId)
			.eq("is_active", true);

		// Si une session courante est spécifiée, ne pas la terminer
		if (currentSessionId) {
			query = query.neq("id", currentSessionId);
		}

		const { error } = await query;

		if (error) throw error;
		return true;
	} catch (error) {
		console.error(
			"Erreur lors de la terminaison de toutes les sessions:",
			error
		);
		throw error;
	}
};

module.exports = {
	createSession,
	getActiveSessions,
	updateSessionActivity,
	terminateSession,
	terminateAllSessions,
};
