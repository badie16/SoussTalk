const messageService = require('../services/messageService');

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const message = await messageService.createMessage({ senderId, receiverId, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await messageService.getMessagesByConversation(conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
