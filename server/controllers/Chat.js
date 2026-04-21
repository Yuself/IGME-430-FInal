const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';

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

/* Builds a baseline prompt for Ollama */
const buildBaselinePrompt = (message) => `
You are an archive guard in a small narrative game.
Respond briefly and naturally.
Stay in character as a guarded but ordinary guard.

Player message:
"${message}"

Write only the guard's reply.
`.trim();

/* Builds a structured prompt for Ollama */
const buildStructuredPrompt = (message, npcState) => `
You are an archive guard in a small narrative game.

Your fixed goal:
- protect the archive

Your current attitude:
- ${npcState.attitude}

Your current objective:
- ${npcState.objective}

Behavior rules:
- stay in character as a guard
- do not reveal sensitive archive contents
- keep the reply brief
- if the objective is "deflect", avoid answering directly
- if the objective is "reject", deny access clearly
- if the objective is "inform", answer simply without overexplaining

Player message:
"${message}"

Write only the guard's reply.
`.trim();

/* Calls Ollama and returns a generated reply */
const generateWithOllama = async (prompt) => {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.response || !data.response.trim()) {
    throw new Error('Ollama returned an empty response');
  }

  return data.response.trim();
};

/* Handles chat requests for baseline and structured modes */
const chat = async (req, res) => {
  const message = `${req.body.message || ''}`.trim();
  const mode = `${req.body.mode || ''}`.trim();

  console.log('Received mode:', mode);

  if (!message || !mode) {
    return res.status(400).json({ error: 'Message and mode are required.' });
  }

  if (mode !== 'baseline' && mode !== 'structured') {
    return res.status(400).json({ error: 'Invalid mode.' });
  }

  try {
    if (mode === 'baseline') {
      const prompt = buildBaselinePrompt(message);
      console.log('Calling Ollama baseline...');
      const reply = await generateWithOllama(prompt);
      console.log('Ollama baseline succeeded.');

      return res.status(200).json({
        reply,
        npcState: {
          attitude: 'neutral',
          objective: 'inform',
        },
      });
    }

    const structuredState = getStructuredResponse(message).npcState;
    const prompt = buildStructuredPrompt(message, structuredState);
    console.log('Calling Ollama structured...');
    const reply = await generateWithOllama(prompt);
    console.log('Ollama structured succeeded.');

    return res.status(200).json({
      reply,
      npcState: structuredState,
    });
  } catch (err) {
    console.log('Fell back to template reply.');
    console.log(err.message);

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
  }
};

module.exports = {
  chat,
};