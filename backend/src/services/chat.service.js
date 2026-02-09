const mongoose = require('mongoose');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const Contact = require('../models/contact.model');
const Message = require('../models/message.model');
const Reaction = require('../models/reaction.model');

async function createChat(ownerId, { contactId }) {
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    const err = new Error('Invalid contactId');
    err.status = 400;
    throw err;
  }

  const contact = await Contact.findOne({ _id: contactId, ownerId });
  if (!contact) {
    const err = new Error('Contact not found');
    err.status = 404;
    throw err;
  }

  const participantId = contact.contactId;

  const existing = await Chat.findOne({
    type: 'private',
    'participants.userId': { $all: [ownerId.toString(), participantId.toString()] }
  });

  if (existing) {
    await existing.populate({ path: 'participants.userId', select: 'username email avatarUrl' });
    return { existed: true, chat: existing.toObject() };
  }

  const chat = new Chat({
    type: 'private',
    participants: [{ userId: ownerId }, { userId: participantId }],
    lastMessageAt: null
  });

  await chat.save();
  await chat.populate({ path: 'participants.userId', select: 'username email avatarUrl' });
  return { existed: false, chat: chat.toObject() };
}

async function listChats(userId) {
  const docs = await Chat.find({ 'participants.userId': userId }).sort({ lastMessageAt: -1, createdAt: -1 })
    .populate({ path: 'participants.userId', select: 'username email avatarUrl' })
    .exec();
  return docs.map(d => d.toObject());
}

async function getChatById(userId, chatId) {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    const err = new Error('Invalid chat id');
    err.status = 400;
    throw err;
  }
  const chat = await Chat.findById(chatId)
    .populate({ path: 'participants.userId', select: 'username email avatarUrl' })
    .exec();
  if (!chat) {
    const err = new Error('Chat not found');
    err.status = 404;
    throw err;
  }
  const isParticipant = (chat.participants || []).some(p => p.userId.equals(userId));
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return chat.toObject();
}

async function deleteChat(userId, chatId, userRole) {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    const err = new Error('Invalid chat id');
    err.status = 400;
    throw err;
  }

  const chat = await Chat.findById(chatId).exec();
  if (!chat) {
    const err = new Error('Chat not found');
    err.status = 404;
    throw err;
  }

  const isParticipant = (chat.participants || []).some(p => p.userId.equals(userId));
  if (!isParticipant && userRole !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const messages = await Message.find({ chatId: chat._id }).select('_id').lean().exec();
  const messageIds = messages.map(m => m._id);
  if (messageIds.length > 0) {
    await Reaction.deleteMany({ messageId: { $in: messageIds } });
  }
  await Message.deleteMany({ chatId: chat._id });
  await Chat.findByIdAndDelete(chat._id);

  return { message: 'Chat deleted' };
}


module.exports = {
  createChat,
  listChats,
  getChatById,
  deleteChat
};
