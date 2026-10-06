const express = require('express');
const router = express.Router();
const {
  handleSageChat,
  getUserSageChats,
  getSageChatById,
  createSageChat,
  deleteSageChat,
  generateFlashcards,
  generateQuiz,
  explainConcept
} = require('../controllers/aiController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, handleSageChat);
router.get('/chats', optionalAuth, getUserSageChats);
router.get('/chats/:chatId', optionalAuth, getSageChatById);
router.post('/chats', optionalAuth, createSageChat);
router.delete('/chats/:chatId', optionalAuth, deleteSageChat);

router.post('/flashcards', authMiddleware, generateFlashcards);
router.post('/quiz', authMiddleware, generateQuiz);
router.post('/explain', authMiddleware, explainConcept);

module.exports = router;
