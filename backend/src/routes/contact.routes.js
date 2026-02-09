const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { create } = require('../controllers/contact.controller');
const { list, getById, remove } = require('../controllers/contact.controller');
const { createContactSchema } = require('../validators/contact.validator');

router.use(authMiddleware);

router.post('/', validate(createContactSchema), create);
router.get('/', list);
router.get('/:id', getById);
router.delete('/:id', remove);

module.exports = router;
