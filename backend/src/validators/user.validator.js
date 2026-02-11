const Joi = require('joi');

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(128).optional()
}).min(1);

module.exports = { updateProfileSchema };