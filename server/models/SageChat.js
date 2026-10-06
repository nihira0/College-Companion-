const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'sage'], required: true },
  text: { type: String, required: true },
  sourceType: { type: String, default: 'Sage AI' },
  sources: { type: Array, default: [] },
  timestamp: { type: Date, default: Date.now }
});

const sageChatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, default: 'Sage Conversation' },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('SageChat', sageChatSchema);
