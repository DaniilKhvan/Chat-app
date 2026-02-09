const mongoose = require('mongoose');
const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const Reaction = require('../models/reaction.model');

async function ensureMessageAndParticipant(userId, messageId) {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid message id');
    err.status = 400;
    throw err;
  }

  const message = await Message.findById(messageId).lean().exec();
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  const chat = await Chat.findById(message.chatId).exec();
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

  return { message, chat };
}

async function addReaction(userId, messageId, { emoji }) {
  const { message } = await ensureMessageAndParticipant(userId, messageId);

  const reaction = new Reaction({
    messageId,
    userId,
    emoji
  });

  try {
    await reaction.save();
  } catch (e) {
    if (e && e.code === 11000) {
      const err = new Error('Reaction already exists');
      err.status = 409;
      throw err;
    }
    throw e;
  }

  return reaction.toObject();
}

async function removeReaction(userId, messageId, emoji) {
  await ensureMessageAndParticipant(userId, messageId);

  const res = await Reaction.findOneAndDelete({ messageId, userId, emoji }).exec();
  if (!res) {
    const err = new Error('Reaction not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Reaction removed' };
}

async function listReactions(userId, messageId) {
  await ensureMessageAndParticipant(userId, messageId);

  const docs = await Reaction.find({ messageId }).lean().exec();

  const map = new Map();
  let userReactions = new Set();

  for (const r of docs) {
    const key = r.emoji;
    const prev = map.get(key);
    map.set(key, prev ? prev + 1 : 1);
    if (r.userId.toString() === userId.toString()) userReactions.add(key);
  }

  const arr = Array.from(map.entries()).map(([emoji, count]) => ({
    emoji,
    count,
    reacted: userReactions.has(emoji)
  }));

  arr.sort((a, b) => b.count - a.count);
  return arr;
}

module.exports = {
  addReaction,
  removeReaction,
  listReactions
};
