const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.use(protect, restrictTo("Manager", "HR", "Admin"));

router.get("/overview", analyticsController.getOverview);
router.get("/attendance-trend", analyticsController.getAttendanceTrend);
router.get("/department-breakdown", analyticsController.getDepartmentBreakdown);
router.get("/leave-trend", analyticsController.getLeaveTrend);
router.get("/workforce-distribution", analyticsController.getWorkforceDistribution);

module.exports = router;
