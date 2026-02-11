// backend/src/controllers/admin.controller.js
const User = require('../models/user.model');
const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const Contact = require('../models/contact.model');
const Reaction = require('../models/reaction.model');

async function deleteUser(req, res, next) {
  try {
    const targetId = req.params.id;
    const requesterRole = req.user.role;
    if (requesterRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    await User.findByIdAndDelete(targetId);
    await Message.deleteMany({ senderId: targetId });
    await Reaction.deleteMany({ userId: targetId });
    await Contact.deleteMany({ $or: [{ ownerId: targetId }, { contactId: targetId }] });

    await Chat.updateMany({}, { $pull: { 'participants': { userId: targetId } } });

    return res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

async function deleteChat(req, res, next) {
  try {
    const chatId = req.params.id;

    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);

    return res.json({ message: 'Chat deleted' });
  } catch (err) {
    next(err);
  }
}

async function deleteMessage(req, res, next) {
  try {
    const messageId = req.params.id;

    await Message.findByIdAndDelete(messageId);
    await Reaction.deleteMany({ messageId });

    return res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deleteUser,
  deleteChat,
  deleteMessage
};
