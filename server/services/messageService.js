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
exports.deleteMessage = async (messageId) => {
  const { data, error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

exports.updateMessage = async (messageId, newText) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ content: newText })
    .eq('id', messageId)
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

exports.getUnreadMessages = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('receiver_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};

exports.markMessageAsRead = async (messageId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId)
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

exports.getMessagesBetweenUsers = async (user1Id, user2Id) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
};
