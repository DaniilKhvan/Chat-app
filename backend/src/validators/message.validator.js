const Joi = require('joi');

const createMessageSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required()
});

const updateMessageSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required()
});

module.exports = { createMessageSchema, updateMessageSchema };
