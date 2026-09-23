const express = require("express");
const router = express.Router();

const appraisalController = require("../controllers/appraisalController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get("/my", protect, appraisalController.getMyAppraisals);
router.get(
  "/summary",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  appraisalController.getAppraisalSummary
);
router.get(
  "/all",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  appraisalController.getAllAppraisals
);
router.get(
  "/user/:id",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  appraisalController.getAppraisalsByUser
);

module.exports = router;
