// Replaces ALL Attendance records with the full contents of backend/data/attendance.csv
// (Present / Absent / Leave rows all become real records), then refills today's
// attendance so the dashboard isn't empty.
//
// Usage: node scripts/reimportAttendance.js

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { loadAttendance } = require("../utils/hrDataset");
const { seedTodayAttendance } = require("../jobs/seedDailyAttendance");

const BATCH_SIZE = 500;
// CSV emp_id N was seeded as employeeId "EMP-(N+1001)" (EMP-1001 is the pre-existing admin).
const employeeIdFor = (empId) => `EMP-${empId + 1001}`;

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({ employeeId: /^EMP-\d+$/ }).select("employeeId");
  const userIdByEmployeeId = new Map(users.map((u) => [u.employeeId, u._id]));

  const rows = loadAttendance();
  const docs = [];
  let skipped = 0;

  for (const row of rows) {
    const userId = userIdByEmployeeId.get(employeeIdFor(row.emp_id));
    if (!userId) {
      skipped += 1;
      continue;
    }

    const date = new Date(row.attendance_date);
    if (row.status !== "Present") {
      docs.push({ user: userId, date, checkIn: null, checkOut: null, status: row.status, hoursWorked: 0 });
      continue;
    }

    const seed = row.attendance_id;
    const checkInMinute = 30 + (seed % 60); // 9:30-10:29 spread
    const checkIn = new Date(date);
    checkIn.setHours(9, checkInMinute % 60, 0, 0);
    if (checkInMinute >= 60) checkIn.setHours(10, checkInMinute - 60, 0, 0);
    const checkOut = new Date(date);
    checkOut.setHours(17 + (seed % 2), (seed * 7) % 60, 0, 0);
    docs.push({ user: userId, date, checkIn, checkOut, status: "Present", hoursWorked: Math.max(checkOut - checkIn, 0) });
  }

  const deleted = await Attendance.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} existing attendance records.`);

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    await Attendance.insertMany(docs.slice(i, i + BATCH_SIZE), { ordered: false });
  }

  const byStatus = docs.reduce((acc, d) => ({ ...acc, [d.status]: (acc[d.status] || 0) + 1 }), {});
  console.log(`Inserted ${docs.length} records from CSV (skipped ${skipped} unmatched):`, byStatus);

  const seededToday = await seedTodayAttendance();
  console.log(`Refilled today's attendance for ${seededToday} employees.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
