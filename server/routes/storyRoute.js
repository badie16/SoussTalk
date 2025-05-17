const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

router.post('/', storyController.createStory);
router.get('/', storyController.getActiveStories);
router.delete('/:id', storyController.deleteStory);

module.exports = router;
