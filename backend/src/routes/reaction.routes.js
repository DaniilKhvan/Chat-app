const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const reactionController = require('../controllers/reaction.controller');
const { createReactionSchema } = require('../validators/reaction.validator');

router.use(authMiddleware);

router.post('/messages/:messageId/reactions', validate(createReactionSchema), reactionController.addReaction);
router.get('/messages/:messageId/reactions', reactionController.getReactions);
router.delete('/messages/:messageId/reactions/:reactionId', reactionController.deleteReaction);

module.exports = router;
