const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['private', 'group'], default: 'private' },
  participants: { type: [participantSchema], required: true }, 
  title: { type: String, default: null }, 
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

chatSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
