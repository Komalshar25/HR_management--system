const Attendance = require("../models/Attendance");

// ---------- CLOCK IN ----------
exports.clockIn = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get latest record for today
    const latest = await Attendance.findOne({
      user: userId,
      date: { $gte: today },
    }).sort({ createdAt: -1 });

    // If today has NO record, create fresh one
    if (!latest) {
      const record = new Attendance({
        user: userId,
        date: new Date(),
        checkIn: new Date(),
        checkOut: null,
        hoursWorked: 0,
      });

      await record.save();
      return res.json(record);
    }

    // If last record is still open → block
    if (!latest.checkOut) {
      return res.status(400).json({ message: "Already clocked in" });
    }

    // If last record is closed → RESUME SAME DAY
    const resumed = new Attendance({
      user: userId,
      date: latest.date,
      checkIn: new Date(),
      checkOut: null,
      hoursWorked: latest.hoursWorked, // carry forward time
    });

    await resumed.save();
    res.json(resumed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Clock-in failed" });
  }
};

// ---------- CLOCK OUT ----------
exports.clockOut = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latest = await Attendance.findOne({
      user: userId,
      date: { $gte: today },
      checkOut: null,
    }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(400).json({ message: "No active clock-in found" });
    }

    const now = new Date();
    const sessionMs = now - new Date(latest.checkIn);

    latest.checkOut = now;
    latest.hoursWorked = latest.hoursWorked + sessionMs;

    await latest.save();
    res.json(latest);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Clock-out failed" });
  }
};

// ---------- GET MY ATTENDANCE ----------
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// ---------- GET ALL ATTENDANCE (Manager/HR/Admin) ----------
exports.getAllAttendance = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await Attendance.find(filter)
      .populate("user", "name email employeeId department")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// ---------- GET ATTENDANCE FOR A SPECIFIC USER (Manager/HR/Admin) ----------
exports.getAttendanceByUser = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.params.id }).sort({
      date: -1,
    });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};