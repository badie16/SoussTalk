const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les messages
router.post(
	"/send",
	messageController.uploadFile,
	messageController.sendMessage
);
router.get("/conversation/:conversationId", messageController.getMessages);
router.get("/conversations", messageController.getUserConversations);
router.delete("/:messageId", messageController.deleteMessage);
router.put("/:messageId", messageController.editMessage);
router.get(
	"/conversation/:conversationId/search",
	messageController.searchMessages
);
router.post("/:messageId/reaction", messageController.addReaction);
router.post("/conversation/:conversationId/read", messageController.markAsRead);

// Routes pour les conversations privées
router.post(
	"/conversation/private",
	messageController.createPrivateConversation
);

// Routes pour les groupes
router.post("/group/create", messageController.createGroup);
router.post(
	"/group/:conversationId/members",
	messageController.addMemberToGroup
);
router.delete(
	"/group/:conversationId/members/:userId",
	messageController.removeMemberFromGroup
);
router.get(
	"/group/:conversationId/members",
	messageController.getConversationMembers
);
router.put("/group/:conversationId/name", messageController.updateGroupName);

// Route pour obtenir les amis
router.get("/friends", messageController.getUserFriends);

// Route pour servir les fichiers
router.get("/files/:filename", messageController.serveFile);

module.exports = router;
