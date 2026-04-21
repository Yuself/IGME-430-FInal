const models = require('../models');

const { Conversation } = models;

/* Saves a completed conversation for the current logged-in user */
const saveConversation = async (req, res) => {
  const {
    title,
    mode,
    debugVisible,
    messages,
    finalAttitude,
    finalObjective,
    turnCount,
    review,
  } = req.body;

  if (!title || !mode || !messages || !review) {
    return res.status(400).json({
      error: 'Title, mode, messages, and review are required.',
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Messages must be a non-empty array.',
    });
  }

  if (mode !== 'baseline' && mode !== 'structured') {
    return res.status(400).json({
      error: 'Invalid mode.',
    });
  }

  if (!review || typeof review !== 'object') {
    return res.status(400).json({
      error: 'Review data is required.',
    });
  }

  try {
    const conversationData = {
      owner: req.session.account._id,
      title,
      mode,
      debugVisible: Boolean(debugVisible),
      messages,
      finalAttitude,
      finalObjective,
      turnCount,
      review,
    };

    const newConversation = new Conversation(conversationData);
    await newConversation.save();

    return res.status(201).json({
      message: 'Conversation saved successfully.',
      conversation: Conversation.toAPI(newConversation),
    });
  } catch {
    return res.status(500).json({
      error: 'An error occurred while saving the conversation.',
    });
  }
};

module.exports = {
  saveConversation,
};