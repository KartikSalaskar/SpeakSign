const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// This is where your Python Server lives
const PYTHON_API_URL = 'http://localhost:8000/predict';

exports.recognize = async (req, res) => {
    try {
        // 1. Check if an image was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded" });
        }

        console.log("📸 Received image for analysis...");

        // 2. Prepare to send it to Python
        const formData = new FormData();
        // Read the file from the 'uploads' folder (or memory)
        const fileStream = fs.createReadStream(req.file.path);
        formData.append('image', fileStream);

        // 3. Send to Python Server (Port 8000)
        const pythonResponse = await axios.post(PYTHON_API_URL, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // 4. Get the Result (e.g., { prediction: "A", confidence: 99.5 })
        const result = pythonResponse.data;
        console.log("🧠 AI says:", result.prediction);

        // 5. Clean up (Delete the temp file)
        fs.unlinkSync(req.file.path);

        // 6. Send answer back to Frontend
        res.json(result);

    } catch (error) {
        console.error("❌ Recognition Error:", error.message);
        // Don't crash if Python is offline
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ 
                message: "AI Brain is offline. Is 'predict_api.py' running?" 
            });
        } else {
            res.status(500).json({ message: "Recognition Failed" });
        }
    }
};