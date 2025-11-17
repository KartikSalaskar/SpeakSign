const axios = require("axios");

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = await axios.post(process.env.AI_SERVICE_URL, { prompt: message });
    return res.json({ success: true, reply: response.data.reply || response.data });
  } catch (error) {
    console.error("Chat Error:", error.message || error);
    return res.status(500).json({ message: "Chat failed" });
  }
};

module.exports = { chat };
