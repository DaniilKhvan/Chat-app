const messageService = require('../services/message.service');

async function create(req, res, next) {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const payload = req.validatedBody;
    const msg = await messageService.createMessage(userId, chatId, payload);
    return res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const msgs = await messageService.listMessages(userId, chatId);
    return res.json(msgs);
  } catch (err) {
    next(err);
  }
}
async function getById(req, res, next) {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;
    const msg = await messageService.getMessageById(userId, messageId);
    return res.json(msg);
  } catch (err) {
    next(err);
  }
}
async function update(req, res, next) {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;
    const payload = req.validatedBody;
    const msg = await messageService.updateMessage(userId, messageId, payload);
    return res.json(msg);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const messageId = req.params.id;
    const result = await messageService.deleteMessage(userId, messageId, userRole);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}




module.exports = { create, list, getById, update, remove };
