const express = require("express");
const router = express.Router();

const recruitmentController = require("../controllers/recruitmentController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get(
  "/summary",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  recruitmentController.getSummary
);
router.get(
  "/all",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  recruitmentController.getAllCandidates
);

module.exports = router;
