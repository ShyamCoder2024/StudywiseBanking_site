const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
// potentially add authMiddleware if this should be protected
// const { protect } = require('../middleware/authMiddleware');

// POST /api/ai/chat
router.post('/chat', chatWithAI);

module.exports = router;
