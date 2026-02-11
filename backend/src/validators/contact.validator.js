const Joi = require('joi');

const createContactSchema = Joi.object({
  contactEmail: Joi.string().email(),
  contactId: Joi.string().hex().length(24),
  nickname: Joi.string().min(1).max(60).optional()
}).xor('contactEmail', 'contactId');

module.exports = { createContactSchema };
