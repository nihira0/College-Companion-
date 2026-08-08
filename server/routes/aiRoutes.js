const express = require('express');
const router = express.Router();
const {
  handleSageChat,
  generateFlashcards,
  generateQuiz,
  explainConcept
} = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/chat', handleSageChat);
router.post('/flashcards', generateFlashcards);
router.post('/quiz', generateQuiz);
router.post('/explain', explainConcept);

module.exports = router;
