const axios = require('axios');

const chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ message: 'No message' });

    let prompt = message;
    if (context && context.latestSign) {
      prompt = `Context: Latest recognized sign = ${context.latestSign}\nUser: ${message}\nAssistant:`;
    }

    const apiUrl = `https://api-inference.huggingface.co/models/gpt2`; // replace with model you use
    const resp = await axios.post(apiUrl, { inputs: prompt, parameters: { max_new_tokens: 150 } }, {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });

    let text = '';
    if (Array.isArray(resp.data) && resp.data[0].generated_text) {
      text = resp.data[0].generated_text;
    } else if (resp.data.generated_text) {
      text = resp.data.generated_text;
    } else {
      text = JSON.stringify(resp.data);
    }

    res.json({ bot: text });
  } catch (err) {
    console.error('chat error', err.message || err);
    res.status(500).json({ message: 'Chat failed' });
  }
};

module.exports = { chat };
