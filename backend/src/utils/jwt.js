const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'n4R7pDk8qZ1sW5xY2vB3cV7tJ0mN8fH4K928';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
