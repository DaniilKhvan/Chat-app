const chatService = require('../services/chat.service');

async function create(req, res, next) {
  try {
    const ownerId = req.user._id;
    const payload = req.validatedBody;
    const result = await chatService.createChat(ownerId, payload);
    if (result.existed) return res.status(200).json(result.chat);
    return res.status(201).json(result.chat);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = req.user._id;
    const chats = await chatService.listChats(userId);
    res.json(chats);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user._id;
    const chatId = req.params.id;
    const chat = await chatService.getChatById(userId, chatId);
    res.json(chat);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const chatId = req.params.id;
    const result = await chatService.deleteChat(userId, chatId, userRole);
    res.json(result);
  } catch (err) {
    next(err);
  }
}


module.exports = { create, list, getById, remove };
