const express = require("express");
const router = express.Router();

const payrollController = require("../controllers/payrollController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get("/my", protect, payrollController.getMyPayroll);
router.get(
  "/summary",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  payrollController.getPayrollSummary
);
router.get(
  "/all",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  payrollController.getAllPayroll
);
router.get(
  "/user/:id",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  payrollController.getPayrollByUser
);

module.exports = router;
