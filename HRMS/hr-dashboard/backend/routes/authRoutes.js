const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes.' },
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// who am I (quick token check)
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;