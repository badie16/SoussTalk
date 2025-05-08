const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const signup = async (userData) => {
    const {
        username,
        email,
        password,
        gender = '',
        avatar_url = '',
        bio = '',
        phone_number = '',
        first_name = '',
        last_name = ''
    } = userData;

    // Vérification si email ou username déjà utilisés
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

    if (checkError) {
        throw new Error("Erreur lors de la vérification de l'utilisateur");
    }

    if (existingUser) {
        throw new Error('Email ou nom d’utilisateur déjà utilisé');
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion du nouvel utilisateur
    const { data, error: insertError } = await supabase
        .from('users')
        .insert([{
            username,
            email,
            password: hashedPassword,
            gender,
            avatar_url,
            bio,
            phone_number,
            first_name,
            last_name
        }])
        .select();

    if (insertError) {
        throw insertError;
    }

    return data[0]; // retourne l'utilisateur inséré
};

const login = async ({ email, password }) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error || !user) {
        throw new Error('Utilisateur non trouvé');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Mot de passe incorrect');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token, user };
};

module.exports = { signup, login };
