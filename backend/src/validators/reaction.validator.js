const Joi = require('joi');

const createReactionSchema = Joi.object({
  emoji: Joi.string().min(1).max(10).required()
});

module.exports = { createReactionSchema };
