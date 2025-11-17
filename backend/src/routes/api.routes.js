const express = require('express');
const router = express.Router();
const { recognize } = require('../controllers/recognize.controller');
const { chat } = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

// during early frontend dev you can remove authMiddleware for open access
router.post('/recognize', authMiddleware, recognize);
router.post('/chat', authMiddleware, chat);

module.exports = router;
