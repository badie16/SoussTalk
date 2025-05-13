const express = require("express");
const router = express.Router();

// 🔁 Import direct des fonctions (pas besoin d'appeler .login sur un objet)
const { signup, login } = require("../services/authService");

// Route pour l'inscription
router.post("/signup", async (req, res) => {
    try {
        const result = await signup(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route pour la connexion
router.post("/login", async (req, res) => {
    try {
        const result = await login(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
