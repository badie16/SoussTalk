const jwt = require("jsonwebtoken")
const { getUserById } = require("../services/userService")

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  try {
    let token

    // Récupérer le token du header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({ message: "Non autorisé, aucun token" })
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Récupérer l'utilisateur à partir du token décodé
    const user = await getUserById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" })
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Non autorisé, token invalide" })
  }
}
