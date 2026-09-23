const Leave = require('../models/Leave');
const User = require('../models/User');

// -------- EMPLOYEE: Request Leave --------
const requestLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // IMPORTANT: use "user" consistently across the system
    const leave = await Leave.create({
      user: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted',
      leave
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------- EMPLOYEE: Get My Leaves --------
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// -------- MANAGER: Get Pending Leaves (EXCLUDING OWN) --------
const getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      status: 'Pending',
      user: { $ne: req.user.id }   // <-- THIS IS THE REAL FIX
    }).populate('user', 'name email employeeId department designation');

    res.json(leaves);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------- MANAGER: Approve/Reject (CANNOT APPROVE OWN) --------
const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // HARD BLOCK ON SELF-APPROVAL
    if (leave.user.toString() === req.user.id) {
      return res.status(403).json({
        message: 'You cannot approve your own leave request'
      });
    }

    leave.status = status;
    await leave.save();

    const updated = await Leave.findById(req.params.id)
      .populate('user', 'name email employeeId');

    res.json(updated);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  requestLeave,
  getMyLeaves,
  getPendingLeaves,
  updateLeaveStatus
};