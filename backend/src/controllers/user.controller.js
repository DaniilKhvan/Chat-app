const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
async function getProfile(req, res, next) {
  try {
    const user = req.user;
    
    const publicProfile = user.toPublic();
    
    return res.json(publicProfile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user._id;
    const { username, email, password } = req.validatedBody;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (username !== undefined) {
      user.username = username;
    }
    
    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    if (password !== undefined) {
      const SALT_ROUNDS = 10;
      user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    await user.save();
    
    const updatedProfile = user.toPublic();
    return res.json(updatedProfile);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };