const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, googleLogin, googleStart, googleCallback } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/google/start', googleStart);
router.get('/google/callback', googleCallback);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
