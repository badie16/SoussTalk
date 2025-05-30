const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
	getUserSessions,
	createUserSession,
	terminateUserSession,
	terminateAllUserSessions,
	updateSessionActivity,
	getSessionStats,
	checkSessionSecurity,
	getSessionHistory,
	markSessionAsTrusted,
} = require("../controllers/sessionController");

// Routes pour les sessions
router.get("/:id", protect, getUserSessions);
router.get("/:id/history", protect, getSessionHistory);
router.put("/:sessionId/trust", protect, markSessionAsTrusted);
router.post("/:id", protect, createUserSession);
router.delete("/:id/:sessionId", protect, terminateUserSession);
router.delete("/all/:id", protect, terminateAllUserSessions);
router.put("/:sessionId/activity", updateSessionActivity);
router.get("/:id/stats", protect, getSessionStats);
router.get("/:sessionId/security-check", protect, checkSessionSecurity);

module.exports = router;
