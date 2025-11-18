// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Needed for Image Uploads
const axios = require('axios');   // Needed to talk to Python
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const PYTHON_URL = 'http://localhost:8000/predict'; // Your Python AI URL

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: '*', // Allow all frontend connections
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Configure Multer (For saving temp images from Webcam)
const upload = multer({ dest: 'uploads/' });

// --- 2. SIGN LANGUAGE KNOWLEDGE BASE (Your Simple Chat Logic) ---
const signLanguageKB = {
  hello: "In ISL, you wave your hand with an open palm near your head.",
  thank: "Place your hand on your chin and move it forward, like blowing a kiss.",
  sorry: "Make a fist and rub it in a circular motion over your heart.",
  help: "Place one hand under the other and lift both hands up together.",
  yes: "Make a fist and nod it up and down like nodding your head.",
  no: "Extend your index and middle finger and tap them to your thumb.",
  please: "Place your open hand on your chest and move it in a circular motion.",
  love: "Cross both arms over your chest, as if hugging yourself.",
  family: "Make 'F' handshapes with both hands and move them in a circle.",
  eat: "Bring your fingers together and tap them to your mouth repeatedly.",
  water: "Tap your index finger to your chin (like the letter 'W').",
  learn: "Place your fingers on your forehead and then move them to your other palm.",
};

function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  
  // Direct Lookup
  for (const [word, explanation] of Object.entries(signLanguageKB)) {
    if (msg.includes(word)) return `Sign for "${word}": ${explanation}`;
  }
  
  // Fallbacks
  if (msg.includes('hi') || msg.includes('hello')) return "Hello! I can teach you ISL signs. Ask me: 'How to sign help?'";
  return "I don't know that sign yet. Try asking about: hello, help, thank you, family, eat, water.";
}

// --- 3. ROUTES ---

// A. Health Check
app.get('/', (req, res) => {
  res.json({ status: 'Online', message: '✅ SpeakSign Backend is Running!' });
});

// B. Chat Route (Stable Rule-Based)
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Please say something." });
  
  const reply = generateResponse(message);
  console.log(`💬 Chat: "${message}" -> "${reply}"`);
  res.json({ reply });
});

// C. Image Recognition Route (The Bridge to Python)
app.post('/api/recognize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image received" });

    console.log("📸 Sending image to Python AI...");

    // Prepare to send to Python
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    // Call Python Server
    const response = await axios.post(PYTHON_URL, formData, {
      headers: { ...formData.getHeaders() }
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    // Send answer to Frontend
    console.log("🧠 AI Prediction:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("❌ AI Error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // Cleanup
    
    res.status(500).json({ 
      prediction: "Error", 
      confidence: 0,
      message: "Could not connect to Python Brain (Is predict_api.py running?)" 
    });
  }
});

// --- 4. START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});