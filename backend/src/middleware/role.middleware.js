// role.middleware.js
function requireRole(...allowed) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowed.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = requireRole;
