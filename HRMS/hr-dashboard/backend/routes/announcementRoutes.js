const express = require("express");
const router = express.Router();
const ac = require("../controllers/announcementController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get("/", protect, ac.list);
router.get("/celebrations", protect, ac.celebrations);
router.post("/", protect, restrictTo("HR", "Admin"), ac.create);
router.delete("/:id", protect, restrictTo("HR", "Admin"), ac.remove);

module.exports = router;
