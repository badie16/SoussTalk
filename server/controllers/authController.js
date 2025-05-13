// controllers/authController.js
const { signup, login } = require("../services/authService");

const signupController = async (req, res) => {
  try {
    const result = await signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Erreur signup:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur login:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { signupController, loginController };
