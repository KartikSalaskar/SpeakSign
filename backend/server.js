const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const PYTHON_URL = 'http://localhost:8000/predict'; // Python AI URL

// --- 1. MIDDLEWARE ---
app.use(cors({ origin: '*' })); // Allow all connections
app.use(express.json());

// Configure Multer for temp image uploads
const upload = multer({ dest: 'uploads/' });

// --- 2. CHATBOT KNOWLEDGE BASE ---
const signLanguageKB = {
  hello: "In ISL, wave your hand with an open palm near your head.",
  thank: "Place hand on chin and move it forward (blowing a kiss).",
  sorry: "Make a fist and rub it in a circle over your heart.",
  help: "Place one hand under the other and lift both up.",
  yes: "Make a fist and nod it up and down.",
  no: "Tap index and middle finger to thumb (like a mouth closing).",
  please: "Move open palm in a circle on your chest.",
  love: "Cross arms over chest (hug yourself).",
  family: "Make 'F' shapes with both hands and circle them.",
  eat: "Tap fingers to mouth repeatedly.",
  water: "Tap index finger to chin (W shape).",
  learn: "Move fingers from forehead to other palm."
};

function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  for (const [word, explanation] of Object.entries(signLanguageKB)) {
    if (msg.includes(word)) return `Sign for "${word}": ${explanation}`;
  }
  if (msg.includes('hi') || msg.includes('hello')) return "Hello! Ask me: 'How to sign help?'";
  return "I don't know that sign. Try: hello, help, thank you, water, eat.";
}

// --- 3. ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Online', message: '✅ Backend is Running!' });
});

// Chat API
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Please say something." });
  const reply = generateResponse(message);
  res.json({ reply });
});

// Image Recognition API (The Bridge to Python)
app.post('/api/recognize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image received" });

    console.log("📸 Received image, sending to Python AI...");

    // 1. Create form data to send file to Python
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    // 2. Send to Python Server
    const response = await axios.post(PYTHON_URL, formData, {
      headers: { ...formData.getHeaders() }
    });

    // 3. Clean up temp file
    fs.unlinkSync(req.file.path);

    console.log("🧠 AI Says:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("❌ Recognition Error:", error.message);
    // Cleanup file if error
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    
    res.status(500).json({ 
      prediction: "Error", 
      message: "AI Brain Offline (Check predict_api.py)" 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});