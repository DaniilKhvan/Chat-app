const Joi = require('joi');

const createChatSchema = Joi.object({
  contactId: Joi.string().hex().length(24).required()
});

module.exports = { createChatSchema };
