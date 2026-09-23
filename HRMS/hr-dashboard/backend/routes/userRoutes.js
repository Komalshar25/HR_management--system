const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  searchUsers,
  createUser,
  updateUserRole,
  updateMe,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");

router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);
router.patch("/me", protect, updateMe);
router.post("/", protect, restrictTo("HR", "Admin"), createUser);
router.patch("/:id/role", protect, restrictTo("Admin"), updateUserRole);
router.get("/:id", protect, getUserById);

module.exports = router;
