
const Joi = require('joi');

function validate(schema) {
  if (!schema || typeof schema.validate !== 'function') {
    throw new Error('Validate middleware requires a Joi schema');
  }

  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({ message: 'Validation error', details });
    }
    req.validatedBody = value;
    return next();
  };
}

module.exports = validate;
