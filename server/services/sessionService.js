const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

// Create a new session with data validation
const createSession = async (userId, deviceInfo = {}) => {
	try {
		console.log(`Creating session for user ${userId}`);

		// Input validation
		if (!userId) {
			throw new Error("User ID required");
		}

		// Check if user exists
		const { data: user, error: userError } = await supabase
			.from("users")
			.select("id")
			.eq("id", userId)
			.single();

		if (userError || !user) {
			console.error("User not found error:", userError);
			throw new Error("User not found");
		}

		// Prepare session data with default values to avoid errors
		const sessionData = {
			id: uuidv4(), // Generate a unique ID for the session
			user_id: userId,
			// token:  , #tu peut ajouter un token qui iditifier session pour pa depluque
			device_name: deviceInfo?.deviceName || "Unknown device",
			device_type: deviceInfo?.deviceType || "Unknown",
			// browser_name: deviceInfo?.browserName || null,
			// browser_version: deviceInfo?.browserVersion || null,
			// os_name: deviceInfo?.osName || null,
			// os_version: deviceInfo?.osVersion || null,
			// screen_resolution: deviceInfo?.screenResolution || null,
			ip_address: deviceInfo?.ipAddress || null,
			// location: deviceInfo?.location || null,
			user_agent: deviceInfo?.userAgent || null,
			// language: deviceInfo?.language || null,
			created_at: new Date().toISOString(),
			last_active: new Date().toISOString(),
			is_active: true,
			is_suspicious: false, // By default, the session is not suspicious
		};
		console.log("Session data to insert:", sessionData);

		// Check if an active session already exists for the same user, device, IP, and user-agent
		// Improved query to better match the same device/browser
		const { data: existingSessions, error: existingError } = await supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.eq("is_active", true);

		if (existingError) {
			console.error("Error checking existing sessions:", existingError);
			throw existingError;
		}

		// Look for a matching session based on device fingerprint
		const matchingSession = existingSessions?.find((session) => {
			// Match based on user agent (most reliable identifier)
			if (
				session.user_agent &&
				sessionData.user_agent &&
				session.user_agent === sessionData.user_agent
			) {
				return true;
			}

			// If user agent doesn't match, try matching on device name and IP
			if (
				session.device_name &&
				sessionData.device_name &&
				session.ip_address &&
				sessionData.ip_address &&
				session.device_name === sessionData.device_name &&
				session.ip_address === sessionData.ip_address
			) {
				return true;
			}

			return false;
		});

		if (matchingSession) {
			console.log("Reusing existing session:", matchingSession.id);

			// Update the last_active timestamp
			await updateSessionActivity(matchingSession.id);

			return matchingSession;
		}

		// Insert the session into the database
		const { data, error } = await supabase
			.from("sessions")
			.insert([sessionData])
			.select()
			.single();

		if (error) {
			console.error("Session insertion error:", error);
			throw error;
		}

		console.log("Session created successfully:", data.id);

		// Check if the session is suspicious (new location, new device, etc.)
		await checkAndUpdateSuspiciousSession(userId, sessionData);

		return data;
	} catch (error) {
		console.error("Error creating session:", error);
		throw error;
	}
};

// Get a session by ID
const getSessionById = async (sessionId) => {
	try {
		if (!sessionId) {
			throw new Error("Session ID required");
		}

		const { data, error } = await supabase
			.from("sessions")
			.select("*")
			.eq("id", sessionId)
			.single();

		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error getting session by ID:", error);
		throw error;
	}
};

// Check if a session is suspicious and update its status
const checkAndUpdateSuspiciousSession = async (userId, newSession) => {
	try {
		// Get previous sessions for the user
		const { data: previousSessions, error } = await supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.eq("is_active", true)
			.neq("id", newSession.id)
			.order("created_at", { ascending: false })
			.limit(5);

		if (error) {
			console.error("Error retrieving previous sessions:", error);
			return;
		}

		// If this is the first session, it's not suspicious
		if (!previousSessions || previousSessions.length === 0) {
			console.log("First session for user, not suspicious");
			return;
		}

		let isSuspicious = false;
		const reasons = [];

		// Check if location is different
		if (
			newSession.location &&
			previousSessions.every(
				(session) =>
					session.location && session.location !== newSession.location
			)
		) {
			isSuspicious = true;
			reasons.push("New location detected");
		}

		// Check if device is different
		if (
			newSession.device_name &&
			previousSessions.every(
				(session) =>
					session.device_name && session.device_name !== newSession.device_name
			)
		) {
			isSuspicious = true;
			reasons.push("New device detected");
		}

		// Check if browser is different
		if (
			newSession.browser_name &&
			previousSessions.every(
				(session) =>
					session.browser_name &&
					session.browser_name !== newSession.browser_name
			)
		) {
			isSuspicious = true;
			reasons.push("New browser detected");
		}

		// If the session is suspicious, update its status
		if (isSuspicious) {
			console.log(
				`Session ${newSession.id} is suspicious. Reasons: ${reasons.join(", ")}`
			);

			await supabase
				.from("sessions")
				.update({
					is_suspicious: true,
					suspicious_reasons: reasons.join(", "),
				})
				.eq("id", newSession.id);

			// Here you could also send a notification to the user
			// or record the event in a security log
		}
	} catch (error) {
		console.error("Error checking for suspicious session:", error);
	}
};

// Get all active sessions for a user with improved error handling
const getActiveSessions = async (userId) => {
	try {
		console.log(`Getting active sessions for user ${userId}`);

		if (!userId) {
			throw new Error("User ID required");
		}

		const { data, error } = await supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.eq("is_active", true)
			.order("last_active", { ascending: false });

		if (error) {
			console.error("SQL error retrieving sessions:", error);
			throw error;
		}

		console.log(`Retrieved ${data?.length || 0} active sessions`);
		return data || [];
	} catch (error) {
		console.error("Error retrieving sessions:", error);
		throw error;
	}
};

// Update a session's last activity with validation
const updateSessionActivity = async (sessionId) => {
	try {
		console.log(`Updating activity for session ${sessionId}`);

		if (!sessionId) {
			throw new Error("Session ID required");
		}

		// Check if the session exists
		const { data: existingSession, error: checkError } = await supabase
			.from("sessions")
			.select("id")
			.eq("id", sessionId)
			.single();

		if (checkError || !existingSession) {
			console.log("Session not found:", checkError);
			throw new Error("Session not found");
		}

		const { error } = await supabase
			.from("sessions")
			.update({ last_active: new Date().toISOString() })
			.eq("id", sessionId);

		if (error) {
			console.error("SQL error updating activity:", error);
			throw error;
		}

		console.log(`Session ${sessionId} activity updated successfully`);
		return true;
	} catch (error) {
		console.error("Error updating session activity:", error);
		throw error;
	}
};

// Terminate a specific session with validation
const terminateSession = async (sessionId) => {
	try {
		console.log(`Terminating session ${sessionId}`);

		if (!sessionId) {
			throw new Error("Session ID required");
		}

		// Check if the session exists
		const { data: existingSession, error: checkError } = await supabase
			.from("sessions")
			.select("id, is_active")
			.eq("id", sessionId)
			.single();

		if (checkError || !existingSession) {
			console.log("Session not found:", checkError);
			throw new Error("Session not found");
		}

		// If the session is already inactive, do nothing
		if (!existingSession.is_active) {
			console.log(`Session ${sessionId} is already inactive`);
			return true;
		}

		const { error } = await supabase
			.from("sessions")
			.update({
				is_active: false,
				ended_at: new Date().toISOString(),
			})
			.eq("id", sessionId);

		if (error) {
			console.error("SQL error terminating session:", error);
			throw error;
		}

		console.log(`Session ${sessionId} terminated successfully`);
		return true;
	} catch (error) {
		console.error("Error terminating session:", error);
		throw error;
	}
};

// Terminate all sessions for a user (except the current session) with validation
const terminateAllSessions = async (userId, currentSessionId = null) => {
	try {
		console.log(
			`Terminating all sessions for user ${userId} except ${currentSessionId}`
		);

		if (!userId) {
			throw new Error("User ID required");
		}

		// Build the base query
		let query = supabase
			.from("sessions")
			.update({
				is_active: false,
				ended_at: new Date().toISOString(),
			})
			.eq("user_id", userId)
			.eq("is_active", true);

		// If a current session ID is specified, don't terminate it
		if (currentSessionId) {
			query = query.neq("id", currentSessionId);
		}

		const { error } = await query;

		if (error) {
			console.error("SQL error terminating all sessions:", error);
			throw error;
		}

		console.log(`All sessions terminated successfully for user ${userId}`);
		return true;
	} catch (error) {
		console.error("Error terminating all sessions:", error);
		throw error;
	}
};

// Get session statistics for a user
const getSessionStats = async (userId) => {
	try {
		console.log(`Getting session stats for user ${userId}`);

		if (!userId) {
			throw new Error("User ID required");
		}

		// Get active sessions count
		const { data: activeSessions, error: activeError } = await supabase
			.from("sessions")
			.select("id")
			.eq("user_id", userId)
			.eq("is_active", true);

		if (activeError) {
			throw activeError;
		}

		// Get last login
		const { data: lastLogin, error: lastLoginError } = await supabase
			.from("sessions")
			.select("created_at")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (lastLoginError && lastLoginError.code !== "PGRST116") {
			// PGRST116 = no rows returned, which is acceptable
			console.log("No last login found");
		}

		// Get unique devices
		const { data: uniqueDevices, error: uniqueError } = await supabase
			.from("sessions")
			.select("device_name", { distinct: true })
			.eq("user_id", userId)
			.not("device_name", "is", null);

		if (uniqueError) {
			throw uniqueError;
		}

		// Count unique devices
		const uniqueDeviceNames = new Set();
		uniqueDevices?.forEach((session) => {
			if (session.device_name) {
				uniqueDeviceNames.add(session.device_name);
			}
		});

		// Get suspicious sessions count
		const { data: suspiciousSessions, error: suspiciousError } = await supabase
			.from("sessions")
			.select("id")
			.eq("user_id", userId)
			.eq("is_suspicious", true);

		if (suspiciousError) {
			throw suspiciousError;
		}

		const stats = {
			activeSessions: activeSessions?.length || 0,
			lastLogin: lastLogin?.created_at || null,
			uniqueDevices: uniqueDeviceNames.size,
			suspiciousLogins: suspiciousSessions?.length || 0,
		};

		console.log(`Session stats for user ${userId}:`, stats);
		return stats;
	} catch (error) {
		console.error("Error retrieving session statistics:", error);
		throw error;
	}
};

module.exports = {
	createSession,
	getSessionById,
	getActiveSessions,
	updateSessionActivity,
	terminateSession,
	terminateAllSessions,
	getSessionStats,
	checkAndUpdateSuspiciousSession,
};
