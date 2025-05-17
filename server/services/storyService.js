const supabase = require("../config/supabase");

exports.createStory = async (user_id, media_url, type, caption) => {
  const { data, error } = await supabase
    .from('stories')
    .insert([{ user_id, media_url, type, caption }])
    .select('*, users(username)')
    .single();

  if (error) throw new Error(error.message);
  return data;
};

exports.getActiveStories = async () => {
  const { data, error } = await supabase
    .from('stories')
    .select('*, users(username)')
    .gt('expires_at', new Date().toISOString());

  if (error) throw new Error(error.message);
  return data;
};

exports.deleteStory = async (storyId) => {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) throw new Error(error.message);
  return { message: "Story deleted successfully" };
};
