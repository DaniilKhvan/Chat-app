const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { deleteUser, deleteChat, deleteMessage } = require('../controllers/admin.controller');

router.use(authMiddleware);

router.delete('/users/:id', requireRole('admin'), deleteUser);

router.delete('/chats/:id', requireRole('admin'), deleteChat);

router.delete('/messages/:id', requireRole('admin'), deleteMessage);

module.exports = router;
