const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Save temp files here

const chatController = require('../controllers/chat.controller');
const recognizeController = require('../controllers/recognize.controller');

// Chat Route
router.post('/chat', chatController.chat);

// Recognition Route (Note the 'upload.single' middleware!)
router.post('/recognize', upload.single('image'), recognizeController.recognize);

module.exports = router;