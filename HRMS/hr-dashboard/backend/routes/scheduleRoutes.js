const express = require('express');
const { getSchedule } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getSchedule);

module.exports = router;