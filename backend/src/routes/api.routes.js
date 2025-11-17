const express = require("express");
const router = express.Router();

const { recognize } = require("../controllers/recognize.controller");
const { chat } = require("../controllers/chat.controller");

// temporary (remove authMiddleware)
router.post("/recognize", recognize);
router.post("/chat", chat);

module.exports = router;
