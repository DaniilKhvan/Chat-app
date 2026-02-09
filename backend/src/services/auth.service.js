const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

async function registerUser({ username, email, password }) {
  const exists = await User.exists({ email });
  if (exists) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ username, email, passwordHash });
  await user.save();

  const token = signToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion });
  return { token, user: user.toPublic() };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  user.lastSeen = new Date();
  await user.save();

  const token = signToken({ id: user._id, role: user.role, tokenVersion: user.tokenVersion });
  return { token, user: user.toPublic() };
}

async function logoutUser(user) {
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  return { message: 'Logged out' };
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
