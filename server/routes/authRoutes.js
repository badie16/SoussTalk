const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const upload = require("../middleware/upload");
router.post("/signup", upload.single("profilePicture"), signup);
router.post('/login', login);

module.exports = router;
