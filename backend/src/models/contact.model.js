const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

contactSchema.index({ ownerId: 1, contactId: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);
