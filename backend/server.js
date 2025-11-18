// server.js - Node.js Backend for SpeakSign Chatbot

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// ✅ ENABLE CORS - This is CRITICAL for frontend-backend communication
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ===== SIGN LANGUAGE KNOWLEDGE BASE =====
const signLanguageKB = {
  hello: "In ISL, you wave your hand with an open palm near your head.",
  thank: "Place your hand on your chin and move it forward, like blowing a kiss.",
  sorry: "Make a fist and rub it in a circular motion over your heart.",
  help: "Place one hand under the other and lift both hands up together.",
  yes: "Make a fist and nod it up and down like nodding your head.",
  no: "Extend your index and middle finger and tap them to your thumb, like a mouth closing.",
  please: "Place your open hand on your chest and move it in a circular motion.",
  love: "Cross both arms over your chest, as if hugging yourself.",
  family: "Make 'F' handshapes with both hands and move them in a circle.",
  friend: "Hook your index fingers together, then switch and hook them the other way.",
  eat: "Bring your fingers together and tap them to your mouth repeatedly.",
  drink: "Make a 'C' shape with your hand and tilt it toward your mouth.",
  water: "Tap your index finger to your chin (like the letter 'W').",
  bathroom: "Shake a 'T' handshape (fist with thumb between index and middle finger).",
  good: "Place your flat hand near your mouth, then move it down to your other palm.",
  bad: "Touch your chin with fingers, then flip your hand down.",
  morning: "Bend your arm at the elbow with palm up, then raise it like the sun rising.",
  night: "Bend your arm and lower your hand like the sun setting below the horizon.",
  learn: "Place your fingers on your forehead and then move them to your other palm, like taking knowledge.",
  understand: "Flick your index finger up near your forehead.",
};

// ===== SIMPLE AI CHAT FUNCTION =====
function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // Check for greetings
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    return "Hello! I'm here to help you learn Indian Sign Language. Ask me about signs like 'hello', 'thank you', 'sorry', etc.";
  }

  // Check for help requests
  if (msg.includes('help') || msg.includes('what can you do')) {
    return "I can teach you ISL signs! Try asking me: 'How do I sign hello?', 'What is the sign for thank you?', or just type any word like 'eat', 'drink', 'family', etc.";
  }

  // Check knowledge base
  for (const [word, explanation] of Object.entries(signLanguageKB)) {
    if (msg.includes(word)) {
      return `Sign for "${word}": ${explanation}`;
    }
  }

  // Check if asking "how to sign" something
  const howToMatch = msg.match(/how (?:do i|to) sign (.+)/);
  if (howToMatch) {
    const word = howToMatch[1].trim();
    if (signLanguageKB[word]) {
      return `Sign for "${word}": ${signLanguageKB[word]}`;
    }
    return `I don't have information about the sign for "${word}" yet. Try asking about: hello, thank you, sorry, help, eat, drink, family, friend, etc.`;
  }

  // Default fallback
  return "I'm not sure about that. Try asking me about signs like 'hello', 'thank you', 'help', 'eat', 'family', etc.";
}

// ===== CHAT ENDPOINT =====
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    console.log(`📩 Received: "${message}"`);

    // Generate AI response
    const reply = generateResponse(message);

    console.log(`✅ Reply: "${reply}"`);

    return res.json({
      success: true,
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🤖 SpeakSign Backend Server         ║
║   ✅ Running on http://localhost:${PORT}  ║
║   📡 Ready to receive chat requests   ║
╚════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});