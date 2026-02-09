const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { create, list, getById, update, remove } = require('../controllers/message.controller');
const { createMessageSchema, updateMessageSchema } = require('../validators/message.validator');

router.use(authMiddleware);

router.post('/chats/:chatId/messages', validate(createMessageSchema), create);
router.get('/chats/:chatId/messages', list);
router.get('/messages/:id', getById);
router.put('/messages/:id', validate(updateMessageSchema), update);
router.delete('/messages/:id', remove);

module.exports = router;
