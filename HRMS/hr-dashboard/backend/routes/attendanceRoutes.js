const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.post("/clock-in", auth.protect, attendanceController.clockIn);
router.post("/clock-out", auth.protect, attendanceController.clockOut);
router.get("/my", auth.protect, attendanceController.getMyAttendance);

router.get(
  "/all",
  auth.protect,
  restrictTo("Manager", "HR", "Admin"),
  attendanceController.getAllAttendance
);
router.get(
  "/user/:id",
  auth.protect,
  restrictTo("Manager", "HR", "Admin"),
  attendanceController.getAttendanceByUser
);

module.exports = router;