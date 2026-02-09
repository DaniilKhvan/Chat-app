const mongoose = require('mongoose');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const Reaction = require('../models/reaction.model');

async function createMessage(userId, chatId, { text }) {
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
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const msg = new Message({
    chatId,
    senderId: userId,
    text,
    createdAt: new Date()
  });

  await msg.save();
  chat.lastMessageAt = msg.createdAt;
  await chat.save();
  await msg.populate({ path: 'senderId', select: 'username email avatarUrl' });

  return msg.toObject();
}

async function listMessages(userId, chatId) {
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
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const docs = await Message.find({ chatId }).sort({ createdAt: 1 })
    .populate({ path: 'senderId', select: 'username email avatarUrl' })
    .lean()
    .exec();

  return docs;
}

async function getMessageById(userId, messageId) {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid message id');
    err.status = 400;
    throw err;
  }

  const msg = await Message.findById(messageId)
    .populate({ path: 'senderId', select: 'username email avatarUrl' })
    .exec();
    
  if (!msg) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  const chat = await Chat.findById(msg.chatId).exec();
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

  return msg.toObject();
}

async function updateMessage(userId, messageId, { text }) {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid message id');
    err.status = 400;
    throw err;
  }

  const msg = await Message.findById(messageId).exec();
  if (!msg) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  if (!msg.senderId.equals(userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  msg.text = text;
  msg.editedAt = new Date();
  await msg.save();
  await msg.populate({ path: 'senderId', select: 'username email avatarUrl' });
  return msg.toObject();
}

async function deleteMessage(userId, messageId, userRole) {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid message id');
    err.status = 400;
    throw err;
  }

  const msg = await Message.findById(messageId).exec();
  if (!msg) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  const isOwner = msg.senderId.equals(userId);
  if (!isOwner && userRole !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  await Reaction.deleteMany({ messageId: msg._id });
  await Message.deleteOne({ _id: msg._id });
  return { message: 'Message deleted' };
}


module.exports = {
  createMessage,
  listMessages,
  getMessageById,
  updateMessage,
  deleteMessage
};
