const express = require('express');
const router = express.Router();
const {
  handleSageChat,
  generateFlashcards,
  generateQuiz,
  explainConcept
} = require('../controllers/aiController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, handleSageChat);
router.post('/flashcards', authMiddleware, generateFlashcards);
router.post('/quiz', authMiddleware, generateQuiz);
router.post('/explain', authMiddleware, explainConcept);

module.exports = router;
