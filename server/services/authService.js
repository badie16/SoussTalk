const jwt = require("jsonwebtoken")
const userService = require("./userService")

// Générer un token JWT
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" },
  )
}

// Authentifier un utilisateur
exports.authenticateUser = async (email, password) => {
  const user = await userService.verifyUserCredentials(email, password)

  if (!user) {
    return null
  }

  // Mettre à jour le statut en ligne
  await userService.updateUserOnlineStatus(user.id, true)

  // Générer un token
  const token = exports.generateToken(user)

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
    },
  }
}

// Enregistrer un nouvel utilisateur
exports.registerUser = async (userData) => {
  // Vérifier si l'utilisateur existe déjà
  const existingUserByEmail = await userService.getUserByEmail(userData.email)
  if (existingUserByEmail) {
    throw new Error("Cet email est déjà utilisé")
  }

  const existingUserByUsername = await userService.getUserByUsername(userData.username)
  if (existingUserByUsername) {
    throw new Error("Ce nom d'utilisateur est déjà utilisé")
  }

  // Créer l'utilisateur
  const newUser = await userService.createUser(userData)

  // Générer un token
  const token = exports.generateToken(newUser)

  return {
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone_number: newUser.phone_number,
      avatar_url: newUser.avatar_url,
      bio: newUser.bio,
    },
  }
}

// Déconnecter un utilisateur
exports.logoutUser = async (userId) => {
  return await userService.updateUserOnlineStatus(userId, false)
}
