// services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const signup = async (userData) => {
  const { username, email, password, gender = "", bio = "", phone_number = "", first_name = "", last_name = "", avatar_url = "" } = userData;

  const { data: existingEmail, error: emailCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (emailCheckError) throw new Error("Erreur vérification email.");
  if (existingEmail) throw new Error("Email déjà utilisé.");

  const { data: existingUsername, error: usernameCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (usernameCheckError) throw new Error("Erreur vérification username.");
  if (existingUsername) throw new Error("Username déjà utilisé.");

  const { data: authUser, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw new Error(`Erreur Supabase Auth: ${authError.message}`);

  const uuid = authUser.user.id;
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error: insertError } = await supabase
    .from("users")
    .insert([{
      id: uuid,
      username,
      password: hashedPassword,
      email,
      gender,
      avatar_url,
      bio,
      phone_number,
      first_name,
      last_name,
    }]);

  if (insertError) {
    await supabase.auth.admin.deleteUser(uuid);
    throw new Error("Erreur insertion base de données.");
  }

  const token = jwt.sign({ id: uuid }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return { token, user: data[0] };
};

const login = async ({ email, password }) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) throw new Error("Utilisateur non trouvé.");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Mot de passe incorrect.");

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return { token, user };
};

module.exports = { signup, login };
