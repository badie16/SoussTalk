const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
	getUserProfile,
	updateUserProfile,
	updateUserAvatar,
	changeUserPassword,
	updateUserPreferences,
	exportUserData,
	deleteUserAccount,
} = require("../controllers/userController");

// Route de test pour vérifier l'authentification
router.get("/test-auth", protect, (req, res) => {
	res.status(200).json({
		message: "Authentification réussie",
		user: {
			id: req.user.id,
			email: req.user.email,
			username: req.user.username,
		},
	});
});

// Routes pour le profil utilisateur
router.get("/profile/:id", protect, getUserProfile);
router.put("/profile/:id", protect, updateUserProfile);
router.post("/avatar/:id", protect, upload.single("avatar"), updateUserAvatar);
router.put("/password/:id", protect, changeUserPassword);
router.put("/preferences/:id", protect, updateUserPreferences);
router.get("/export/:id", protect, exportUserData);
router.delete("/:id", protect, deleteUserAccount);

module.exports = router;
