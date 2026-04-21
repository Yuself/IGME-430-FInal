/* Returns a simple baseline-style reply */
const getBaselineReply = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('inside') || lowerMessage.includes('archive')) {
    return 'It contains records and materials.';
  }

  if (lowerMessage.includes('enter') || lowerMessage.includes('go in')) {
    return 'The archive is restricted.';
  }

  if (lowerMessage.includes('who are you')) {
    return 'I am the guard assigned to this area.';
  }

  return 'The archive is under watch.';
};

/* Returns a structured reply and a minimal npc state */
const getStructuredResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('inside')
    || lowerMessage.includes('secret')
    || lowerMessage.includes('hiding')
  ) {
    return {
      reply: 'The contents of the archive are not something I can discuss.',
      npcState: {
        attitude: 'suspicious',
        objective: 'deflect',
      },
    };
  }

  if (
    lowerMessage.includes('let me in')
    || lowerMessage.includes('demand')
    || lowerMessage.includes('now')
  ) {
    return {
      reply: 'You are not authorized to enter the archive.',
      npcState: {
        attitude: 'suspicious',
        objective: 'reject',
      },
    };
  }

  if (lowerMessage.includes('enter') || lowerMessage.includes('go in')) {
    return {
      reply: 'You are not permitted to enter the archive.',
      npcState: {
        attitude: 'neutral',
        objective: 'reject',
      },
    };
  }

  if (lowerMessage.includes('who are you')) {
    return {
      reply: 'I am assigned to guard the archive.',
      npcState: {
        attitude: 'neutral',
        objective: 'inform',
      },
    };
  }

  return {
    reply: 'I am here to protect the archive.',
    npcState: {
      attitude: 'neutral',
      objective: 'inform',
    },
  };
};

/* Handles chat requests for baseline and structured modes */
const chat = (req, res) => {
  const message = `${req.body.message || ''}`.trim();
  const mode = `${req.body.mode || ''}`.trim();

  if (!message || !mode) {
    return res.status(400).json({ error: 'Message and mode are required.' });
  }

  if (mode !== 'baseline' && mode !== 'structured') {
    return res.status(400).json({ error: 'Invalid mode.' });
  }

  if (mode === 'baseline') {
    return res.status(200).json({
      reply: getBaselineReply(message),
      npcState: {
        attitude: 'neutral',
        objective: 'inform',
      },
    });
  }

  return res.status(200).json(getStructuredResponse(message));
};

module.exports = {
  chat,
};