const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const { protect } = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const User = require("../models/User");

// Employee: request leave
router.post("/request", protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      user: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "Pending",
    });

    res.status(201).json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Employee: get own leaves
router.get("/my", protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ MANAGER ONLY: get all pending leaves
router.get("/pending", protect, async (req, res) => {
  try {
    const manager = await User.findById(req.user.id);

    if (!manager || !["Manager", "HR", "Admin"].includes(manager.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pendingLeaves = await Leave.find({
  status: "Pending",
  user: { $ne: req.user.id }   // 🔥 exclude manager’s own requests
})
.populate("user", "name email employeeId department designation");
    res.json(pendingLeaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ MANAGER ONLY: approve/reject leave
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const manager = await User.findById(req.user.id);

    if (!manager || !["Manager", "HR", "Admin"].includes(manager.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // 🔥 CRITICAL FIX — prevent self-approval
    if (leave.user.toString() === req.user.id) {
      return res.status(403).json({
        message: "You cannot approve your own leave request"
      });
    }

    leave.status = status;
    await leave.save();

    const updated = await Leave.findById(req.params.id)
      .populate("user", "name email employeeId");

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ MANAGER/HR/ADMIN: get all leave requests, optionally filtered by status
router.get(
  "/all",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const leaves = await Leave.find(filter)
        .populate("user", "name email employeeId department")
        .sort({ createdAt: -1 });

      res.json(leaves);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ MANAGER/HR/ADMIN: get leave history for a specific employee
router.get(
  "/user/:id",
  protect,
  restrictTo("Manager", "HR", "Admin"),
  async (req, res) => {
    try {
      const leaves = await Leave.find({ user: req.params.id }).sort({
        createdAt: -1,
      });
      res.json(leaves);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;