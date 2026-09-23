const express = require("express");
const router = express.Router();
const rc = require("../controllers/recognitionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, rc.giveKudos);
router.get("/recent", protect, rc.getRecent);
router.get("/leaderboard", protect, rc.getLeaderboard);
router.get("/user/:id", protect, rc.getForUser);

module.exports = router;
