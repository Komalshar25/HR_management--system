const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getUserAttendance,
  checkIn,
  checkOut,
} = require("../controllers/attendanceController");

// Attendance routes
router.get("/my", protect, getUserAttendance);
router.post("/clock-in", protect, checkIn);
router.post("/clock-out", protect, checkOut);

module.exports = router;