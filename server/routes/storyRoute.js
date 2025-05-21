const express = require("express");
const router = express.Router();
const storyController = require("../controllers/storyController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Appliquer le middleware d'authentification à toutes les routes
router.use(protect);

// Créer une story (avec upload si nécessaire)
router.post("/", upload.single("media"), storyController.createStory);

// Récupérer les stories actives des amis
router.get("/friends", storyController.getFriendsStories);

// Récupérer toutes les stories actives (pour admin)
router.get("/all", storyController.getActiveStories);

// Récupérer les stories d'un utilisateur spécifique
router.get("/user/:userId", storyController.getUserStories);

// Récupérer les stories vues par l'utilisateur
router.get("/viewed", storyController.getViewedStories);

// Récupérer une story par son ID
router.get("/:id", storyController.getStoryById);

// Marquer une story comme vue
router.post("/:id/view", storyController.markStoryAsViewed);

// Réagir à une story
router.post("/:id/react", storyController.reactToStory);

// Répondre à une story
router.post("/:id/reply", storyController.replyToStory);

// Supprimer une story
router.delete("/:id", storyController.deleteStory);

module.exports = router;
