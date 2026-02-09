const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { create, list, getById, remove } = require('../controllers/chat.controller');
const { createChatSchema } = require('../validators/chat.validator');

router.use(authMiddleware);

router.post('/', validate(createChatSchema), create); 
router.get('/', list);
router.get('/:id', getById);
router.delete('/:id', remove);

module.exports = router;
