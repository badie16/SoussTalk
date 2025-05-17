const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");

// Appliquer protect à toutes les routes
router.use(protect);

// Routes pour les amis
router.get("/suggestions", friendController.getSuggestedFriends);
router.get("/requests", friendController.getFriendRequests);
router.post("/request", friendController.sendFriendRequest); // plus de :userId
router.delete("/request/:targetUserId", friendController.cancelFriendRequest); // garder friendId
router.post("/accept", friendController.acceptFriendRequest); // plus de :userId
router.post("/reject", friendController.rejectFriendRequest); // plus de :userId
router.delete("/d/:targetUserId", friendController.removeFriend); // garder friendId
router.get("/", friendController.getFriends);

module.exports = router;
