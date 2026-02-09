const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tokenVersion: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});


userSchema.index({ email: 1 });



userSchema.methods.toPublic = function() {
  const { _id, username, email, role, createdAt, lastSeen } = this.toObject();
  return { _id, username, email, role,createdAt, lastSeen };
};

module.exports = mongoose.model('User', userSchema);
