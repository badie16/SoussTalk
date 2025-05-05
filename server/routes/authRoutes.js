const express = require("express")
const authController = require("../controllers/authController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

// Routes d'authentification
router.post("/login", authController.login)
router.post("/register", authController.register)
router.post("/logout", protect, authController.logout)
router.get("/me", protect, authController.getMe)

module.exports = router
