const storyService = require('../services/storyService');

exports.createStory = async (req, res) => {
  try {
    const { user_id, media_url, type, caption } = req.body;
    const story = await storyService.createStory(user_id, media_url, type, caption);
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveStories = async (req, res) => {
  try {
    const stories = await storyService.getActiveStories();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  const storyId = req.params.id;

  try {
    const result = await storyService.deleteStory(storyId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

