// Creates today's attendance for most employees so the "Present Today" numbers
// aren't empty. Anyone who already has a record for today is left alone.

const User = require("../models/User");
const Attendance = require("../models/Attendance");

const BATCH_SIZE = 500;
const ATTENDANCE_RATE = 0.8;

const seedFor = (str) =>
  String(str)
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

const seedTodayAttendance = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const already = new Set(
    (await Attendance.find({ date: { $gte: today, $lt: tomorrow } }).select("user")).map((r) => r.user.toString())
  );

  const allUsers = await User.find().select("employeeId");
  const candidates = allUsers.filter((u) => !already.has(u._id.toString()));

  const docs = [];
  for (const user of candidates) {
    const seed = seedFor(user.employeeId || user._id.toString());
    if ((seed % 100) / 100 >= ATTENDANCE_RATE) continue;

    const checkInMinute = 30 + (seed % 105); // ~9:30-11:15 spread, some late arrivals
    const checkIn = new Date(today);
    checkIn.setHours(9, 0, 0, 0);
    checkIn.setMinutes(checkIn.getMinutes() + checkInMinute);

    const hasCheckedOut = seed % 3 !== 0; // ~2/3 checked out, rest still "working"
    let checkOut = null;
    let hoursWorked = 0;
    if (hasCheckedOut) {
      checkOut = new Date(checkIn);
      checkOut.setHours(checkOut.getHours() + 8 + (seed % 3), checkOut.getMinutes() + (seed % 40));
      hoursWorked = checkOut - checkIn;
    }

    docs.push({
      user: user._id,
      date: today,
      checkIn,
      checkOut,
      status: "Present",
      hoursWorked,
    });
  }

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    await Attendance.insertMany(docs.slice(i, i + BATCH_SIZE), { ordered: false });
  }

  console.log(`[seedDailyAttendance] Seeded today's attendance for ${docs.length} employees.`);
  return docs.length;
};

module.exports = { seedTodayAttendance };
