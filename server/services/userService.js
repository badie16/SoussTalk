const supabase = require('../config/supabase');

// Récupérer un utilisateur par ID (UUID)
const getUserById = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uuid', id)
        .single();

    if (error) throw error;
    return data;
};

// Mettre à jour les infos d’un utilisateur
const updateUser = async (id, updates) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('uuid', id)
        .single();

    if (error) throw error;
    return data;
};

// Supprimer un utilisateur
const deleteUser = async (id) => {
    const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('uuid', id);

    if (error) throw error;
    return data;
};

module.exports = {
    getUserById,
    updateUser,
    deleteUser
};
