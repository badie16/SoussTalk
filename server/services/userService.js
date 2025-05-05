const supabase = require("../config/supabase")
const bcrypt = require("bcryptjs")

// Récupérer un utilisateur par son ID
exports.getUserById = async (id) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) {
    throw new Error(error.message)
  }

  return user
}

// Récupérer un utilisateur par son email
exports.getUserByEmail = async (email) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 est le code d'erreur quand aucun résultat n'est trouvé
    throw new Error(error.message)
  }

  return user
}

// Récupérer un utilisateur par son nom d'utilisateur
exports.getUserByUsername = async (username) => {
  const { data: user, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return user
}

// Créer un nouvel utilisateur
exports.createUser = async (userData) => {
  // Créer d'abord l'utilisateur dans auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  // Hacher le mot de passe pour notre table users personnalisée
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(userData.password, salt)

  // Créer l'utilisateur dans notre table users personnalisée
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        id: authUser.user.id, // Utiliser l'ID généré par auth.users
        username: userData.username,
        email: userData.email,
        phone_number: userData.phone_number || null,
        password_hash: hashedPassword,
        is_online: true,
      },
    ])
    .select()
    .single()

  if (userError) {
    // Supprimer l'utilisateur auth si la création dans users échoue
    await supabase.auth.admin.deleteUser(authUser.user.id)
    throw new Error(userError.message)
  }

  return { ...newUser, auth_id: authUser.user.id }
}

// Mettre à jour le statut en ligne d'un utilisateur
exports.updateUserOnlineStatus = async (userId, isOnline) => {
  const { error } = await supabase.from("users").update({ is_online: isOnline }).eq("id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

// Vérifier les identifiants de l'utilisateur
exports.verifyUserCredentials = async (email, password) => {
  const user = await exports.getUserByEmail(email)

  if (!user) {
    return null
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)

  if (!isMatch) {
    return null
  }

  return user
}
