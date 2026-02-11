const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const payload = req.validatedBody; 
    const result = await authService.registerUser(payload);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const payload = req.validatedBody;
    const result = await authService.loginUser(payload);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    const result = await authService.logoutUser(user);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout };
