const axios = require('axios');

const recognize = async (req, res) => {
  try {
    const { frame } = req.body;
    if (!frame) return res.status(400).json({ message: 'No frame provided' });

    // forward to AI service
    const resp = await axios.post(process.env.AI_SERVICE_URL, { frame }, { timeout: 20000 });
    return res.json({ success: true, result: resp.data });
  } catch (err) {
    console.error('recognize error', err.message || err);
    return res.status(500).json({ message: 'Recognition failed' });
  }
};

module.exports = { recognize };
