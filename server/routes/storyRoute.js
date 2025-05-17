const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.post('/', storyController.createStory);
router.get('/', storyController.getActiveStories);

module.exports = router;
