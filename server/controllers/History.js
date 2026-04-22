const models = require('../models');

const { Conversation } = models;

/* Renders the history page */
const historyPage = (req, res) => res.render('history');

/* Returns all conversations for the current logged-in user */
const getConversations = async (req, res) => {
    try {
        const docs = await Conversation.find({ owner: req.session.account._id })
            .select('title mode updatedAt')
            .sort({ updatedAt: -1 })
            .lean();

        return res.status(200).json({ conversations: docs });
    } catch {
        return res.status(500).json({
            error: 'Failed to load conversations.',
        });
    }
};

/* Returns one conversation by id, only if it belongs to the current user */
const getConversationById = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            error: 'Conversation id is required.',
        });
    }

    try {
        const doc = await Conversation.findOne({
            _id: id,
            owner: req.session.account._id,
        }).lean();

        if (!doc) {
            return res.status(404).json({
                error: 'Conversation not found.',
            });
        }

        return res.status(200).json({ conversation: doc });
    } catch {
        return res.status(500).json({
            error: 'Failed to load conversation.',
        });
    }
};

module.exports = {
    historyPage,
    getConversations,
    getConversationById,
};