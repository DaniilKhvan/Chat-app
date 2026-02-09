const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  url: String,
  filename: String,
  size: Number,
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  attachments: { type: [attachmentSchema], default: [] },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  editedAt: { type: Date, default: null },
  deleted: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
