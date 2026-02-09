const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { updateProfileSchema } = require('../validators/user.validator');

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);

module.exports = router;