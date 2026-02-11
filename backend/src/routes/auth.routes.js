// auth.routes.js
const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.post('/logout', authMiddleware, logout);

module.exports = router;
