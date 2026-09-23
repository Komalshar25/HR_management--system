const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const DAY_MS = 24 * 60 * 60 * 1000;
const LATE_HOUR = 9;
const LATE_MINUTE = 30;
const STANDARD_WORKDAY_MS = 8 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const isLate = (checkIn) => {
  const d = new Date(checkIn);
  return (
    d.getHours() > LATE_HOUR ||
    (d.getHours() === LATE_HOUR && d.getMinutes() > LATE_MINUTE)
  );
};

exports.getOverview = async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + DAY_MS);

    const totalEmployees = await User.countDocuments();

    const todaysAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      status: "Present",
    }).distinct("user");
    const presentToday = todaysAttendance.length;

    const onLeaveDocs = await Leave.find({
      status: "Approved",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).distinct("user");
    const onLeaveToday = onLeaveDocs.length;

    const absentToday = Math.max(
      totalEmployees - presentToday - onLeaveToday,
      0
    );

    res.json({ totalEmployees, presentToday, onLeaveToday, absentToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute overview" });
  }
};

exports.getAttendanceTrend = async (req, res) => {
  try {
    const range = req.query.range || "daily";
    const totalEmployees = await User.countDocuments();

    let periods = 14;
    let bucketFn;
    let labelFn;

    if (range === "weekly") {
      periods = 8;
      bucketFn = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const monday = new Date(date);
        monday.setDate(date.getDate() - ((day + 6) % 7));
        return startOfDay(monday).getTime();
      };
      labelFn = (key) =>
        new Date(key).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
    } else if (range === "monthly") {
      periods = 6;
      bucketFn = (d) => {
        const date = new Date(d);
        return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      };
      labelFn = (key) =>
        new Date(key).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        });
    } else {
      bucketFn = (d) => startOfDay(d).getTime();
      labelFn = (key) =>
        new Date(key).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
    }

    const now = new Date();
    let windowStart;
    if (range === "weekly") windowStart = new Date(now.getTime() - periods * 7 * DAY_MS);
    else if (range === "monthly")
      windowStart = new Date(now.getFullYear(), now.getMonth() - periods, 1);
    else windowStart = new Date(now.getTime() - periods * DAY_MS);

    const records = await Attendance.find({ date: { $gte: windowStart } });

    const buckets = new Map();
    for (const rec of records) {
      const key = bucketFn(rec.date);
      if (!buckets.has(key)) {
        buckets.set(key, {
          key,
          users: new Set(),
          late: 0,
          overtimeMs: 0,
        });
      }
      if (rec.status !== "Present") continue;
      const bucket = buckets.get(key);
      bucket.users.add(rec.user.toString());
      if (rec.checkIn && isLate(rec.checkIn)) bucket.late += 1;
      if (rec.hoursWorked > STANDARD_WORKDAY_MS) {
        bucket.overtimeMs += rec.hoursWorked - STANDARD_WORKDAY_MS;
      }
    }

    const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
    const data = sortedKeys.map((key) => {
      const b = buckets.get(key);
      const present = b.users.size;
      return {
        label: labelFn(key),
        present,
        attendanceRate: totalEmployees
          ? Math.round((present / totalEmployees) * 100)
          : 0,
        late: b.late,
        overtimeHours: Math.round((b.overtimeMs / (60 * 60 * 1000)) * 10) / 10,
      };
    });

    res.json({ range, totalEmployees, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute attendance trend" });
  }
};

exports.getDepartmentBreakdown = async (req, res) => {
  try {
    const users = await User.find().select("department");
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + DAY_MS);

    const presentUserIds = new Set(
      (
        await Attendance.find({
          date: { $gte: today, $lt: tomorrow },
        }).select("user")
      ).map((r) => r.user.toString())
    );

    const byDept = new Map();
    for (const u of users) {
      const dept = u.department || "Unassigned";
      if (!byDept.has(dept)) byDept.set(dept, { department: dept, headcount: 0, presentToday: 0 });
      const entry = byDept.get(dept);
      entry.headcount += 1;
      if (presentUserIds.has(u._id.toString())) entry.presentToday += 1;
    }

    res.json(Array.from(byDept.values()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute department breakdown" });
  }
};

exports.getLeaveTrend = async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const now = new Date();
    const months = range === "weekly" ? 3 : 6;
    const windowStart = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const leaves = await Leave.find({ createdAt: { $gte: windowStart } });

    const buckets = new Map();
    for (const leave of leaves) {
      const d = new Date(leave.createdAt);
      const key = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      if (!buckets.has(key)) {
        buckets.set(key, { key, Pending: 0, Approved: 0, Rejected: 0, total: 0 });
      }
      const bucket = buckets.get(key);
      bucket[leave.status] = (bucket[leave.status] || 0) + 1;
      bucket.total += 1;
    }

    const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
    const data = sortedKeys.map((key) => {
      const b = buckets.get(key);
      return {
        label: new Date(key).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        }),
        pending: b.Pending,
        approved: b.Approved,
        rejected: b.Rejected,
        total: b.total,
      };
    });

    const byType = {};
    for (const leave of leaves) {
      byType[leave.leaveType] = (byType[leave.leaveType] || 0) + 1;
    }

    res.json({ range, data, byType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute leave trend" });
  }
};

exports.getWorkforceDistribution = async (req, res) => {
  try {
    const users = await User.find().select("role department");

    const byRole = {};
    const byDepartment = {};
    for (const u of users) {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
      const dept = u.department || "Unassigned";
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }

    res.json({
      byRole: Object.entries(byRole).map(([label, value]) => ({ label, value })),
      byDepartment: Object.entries(byDepartment).map(([label, value]) => ({
        label,
        value,
      })),
      total: users.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute workforce distribution" });
  }
};
