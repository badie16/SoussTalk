const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notificationController")
const {protect} = require("../middleware/authMiddleware")

// Toutes les routes nécessitent une authentification
router.use(protect);

// Créer une notification
router.post("/", notificationController.createNotification)

// Obtenir les notifications d'un utilisateur
router.get("/user/:userId", notificationController.getUserNotifications)

// Obtenir le nombre de notifications non lues
router.get("/user/:userId/unread-count", notificationController.getUnreadCount)

// Marquer une notification comme lue
router.put("/:notificationId/read", notificationController.markNotificationAsRead)

// Marquer toutes les notifications comme lues
router.put("/user/:userId/read-all", notificationController.markAllNotificationsAsRead)

// Supprimer une notification
router.delete("/:notificationId", notificationController.deleteNotification)

module.exports = router
