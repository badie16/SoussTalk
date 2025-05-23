const supabase = require("../config/supabase");

exports.createMessage = async ({ senderId, receiverId, text }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content: text }])
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

exports.getMessagesByConversation = async (conversationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};

