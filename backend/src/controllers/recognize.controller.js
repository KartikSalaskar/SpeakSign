const axios = require("axios");

const recognize = async (req, res) => {
  try {
    const { frame } = req.body;
    if (!frame) return res.status(400).json({ message: "No frame provided" });

    const response = await axios.post(process.env.AI_SERVICE_URL, { frame });
    return res.json({ success: true, result: response.data });
  } catch (error) {
    console.error("Recognize Error:", error.message || error);
    return res.status(500).json({ message: "Recognition failed" });
  }
};

module.exports = { recognize };
