const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });

    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = verifyToken(token);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }


    const user = await User.findById(payload.id).select('+passwordHash +tokenVersion'); 
    if (!user) return res.status(401).json({ message: 'User not found' });

  
    if (typeof payload.tokenVersion !== 'undefined' && payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token invalidated' });
    }

 
    req.user = user; 
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
