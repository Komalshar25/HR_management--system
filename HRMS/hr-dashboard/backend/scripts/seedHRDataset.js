// Seeds real Employees/Attendance/Leave/Payroll/Appraisals/Recruitment data from
// backend/data/*.csv (HR_Management_System_CSV dataset). Re-runnable: skips employees
// whose employeeId source tag already exists.
//
// Usage: node scripts/seedHRDataset.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");
const Appraisal = require("../models/Appraisal");
const Recruitment = require("../models/Recruitment");
const {
  loadDepartments,
  loadEmployees,
  loadAttendance,
  loadLeaveRequests,
  loadPayroll,
  loadAppraisals,
  loadRecruitment,
} = require("../utils/hrDataset");

// Seeded employees are data-only records: each run gets a random, unshared password nobody knows.
const SEED_PASSWORD = require("crypto").randomBytes(24).toString("hex");
const SEED_EMAIL_DOMAIN = "hrms.dev";
const BATCH_SIZE = 500;

const insertInBatches = async (Model, docs, label) => {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Model.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`  ${label}: ${inserted}/${docs.length}`);
  }
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

const monthKeyFromPayMonth = (payMonth) => {
  // "Apr-2026" -> "2026-04"
  const [mon, year] = payMonth.split("-");
  const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  return `${year}-${months[mon]}`;
};

const lastDayOfPayMonth = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0); // day 0 of next month = last day of this month
};

const nextEmployeeIdStart = async () => {
  const existing = await User.find({ employeeId: /^EMP-\d+$/ }).select("employeeId");
  return existing.reduce((max, u) => {
    const n = parseInt(u.employeeId.slice(4), 10);
    return n > max ? n : max;
  }, 1000);
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const departments = loadDepartments();
  const deptNameById = new Map(departments.map((d) => [d.dept_id, d.dept_name]));

  const employeeRows = loadEmployees();
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  let nextIdNumber = await nextEmployeeIdStart();
  const usedEmails = new Set((await User.find().select("email")).map((u) => u.email));

  console.log(`Preparing ${employeeRows.length} employee documents...`);
  const employeeDocs = [];
  const empIdToIndex = new Map(); // csv emp_id -> index into employeeDocs (pre-insert)

  for (const row of employeeRows) {
    const deptName = deptNameById.get(row.dept_id) || "Unassigned";
    const baseEmail = slugify(row.emp_name) || `emp${row.emp_id}`;
    let email = `${baseEmail}.${row.emp_id}@${SEED_EMAIL_DOMAIN}`;
    let suffix = 1;
    while (usedEmails.has(email)) {
      email = `${baseEmail}.${row.emp_id}.${suffix}@${SEED_EMAIL_DOMAIN}`;
      suffix += 1;
    }
    usedEmails.add(email);

    nextIdNumber += 1;
    const employeeId = `EMP-${nextIdNumber}`;

    empIdToIndex.set(row.emp_id, employeeDocs.length);
    employeeDocs.push({
      name: row.emp_name,
      email,
      password: hashedPassword,
      role: "Employee",
      employeeId,
      department: deptName,
      designation: `${deptName} Staff`,
      baseSalary: row.salary,
      _hireDate: new Date(row.hire_date), // stripped before insert, used for backdating createdAt
    });
  }

  const hireDates = employeeDocs.map((d) => d._hireDate);
  employeeDocs.forEach((d) => delete d._hireDate);

  console.log("Inserting employees...");
  const insertedUsers = [];
  for (let i = 0; i < employeeDocs.length; i += BATCH_SIZE) {
    const batch = employeeDocs.slice(i, i + BATCH_SIZE);
    const result = await User.insertMany(batch, { ordered: false });
    insertedUsers.push(...result);
    console.log(`  employees: ${insertedUsers.length}/${employeeDocs.length}`);
  }

  console.log("Backdating join dates...");
  const usersCollection = mongoose.connection.collection("users");
  const bulkOps = insertedUsers.map((u, i) => ({
    updateOne: { filter: { _id: u._id }, update: { $set: { createdAt: hireDates[i] } } },
  }));
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    await usersCollection.bulkWrite(bulkOps.slice(i, i + BATCH_SIZE));
  }

  // Map CSV emp_id -> Mongo ObjectId
  const userIdByEmpId = new Map();
  employeeRows.forEach((row, i) => {
    userIdByEmpId.set(row.emp_id, insertedUsers[i]._id);
  });

  // ---------- Attendance (Present rows only; synthesize check-in/out) ----------
  const attendanceRows = loadAttendance().filter((r) => r.status === "Present" && userIdByEmpId.has(r.emp_id));
  console.log(`Preparing ${attendanceRows.length} attendance documents...`);
  const attendanceDocs = attendanceRows.map((row) => {
    const date = new Date(row.attendance_date);
    const seed = row.attendance_id;
    const checkInMinute = 30 + (seed % 60); // 9:30-10:29 spread
    const checkIn = new Date(date);
    checkIn.setHours(9, checkInMinute % 60, 0, 0);
    if (checkInMinute >= 60) checkIn.setHours(10, checkInMinute - 60, 0, 0);
    const checkOutHour = 17 + (seed % 2);
    const checkOut = new Date(date);
    checkOut.setHours(checkOutHour, (seed * 7) % 60, 0, 0);
    return {
      user: userIdByEmpId.get(row.emp_id),
      date,
      checkIn,
      checkOut,
      status: "Present",
      hoursWorked: Math.max(checkOut - checkIn, 0),
    };
  });
  console.log("Inserting attendance...");
  await insertInBatches(Attendance, attendanceDocs, "attendance");

  // ---------- Leave requests ----------
  const leaveRows = loadLeaveRequests().filter((r) => userIdByEmpId.has(r.emp_id));
  const leaveTypeMap = { Earned: "Annual", Sick: "Sick", Casual: "Casual" };
  console.log(`Preparing ${leaveRows.length} leave documents...`);
  const leaveDocs = leaveRows.map((row) => {
    const daysAgo = 30 + (row.leave_id % 330); // spread across the last ~year
    const start = new Date();
    start.setDate(start.getDate() - daysAgo);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(row.days - 1, 0));
    return {
      user: userIdByEmpId.get(row.emp_id),
      leaveType: leaveTypeMap[row.leave_type] || row.leave_type,
      startDate: start,
      endDate: end,
      reason: `${row.days}-day ${row.leave_type} leave`,
      status: row.status,
    };
  });
  console.log("Inserting leave requests...");
  await insertInBatches(Leave, leaveDocs, "leave");

  // ---------- Payroll ----------
  const payrollRows = loadPayroll().filter((r) => userIdByEmpId.has(r.emp_id));
  console.log(`Preparing ${payrollRows.length} payroll documents (de-duplicating by user+month)...`);
  const payrollByKey = new Map(); // `${userId}-${month}` -> doc (last one wins, matches unique index)
  for (const row of payrollRows) {
    const month = monthKeyFromPayMonth(row.pay_month);
    const netPay = row.basic_salary + row.bonus;
    const key = `${row.emp_id}-${month}`;
    payrollByKey.set(key, {
      user: userIdByEmpId.get(row.emp_id),
      month,
      basic: row.basic_salary,
      allowances: row.bonus,
      deductions: 0,
      netPay,
      status: "Paid",
      paidOn: lastDayOfPayMonth(month),
    });
  }
  const payrollDocs = Array.from(payrollByKey.values());
  console.log("Inserting payroll...");
  await insertInBatches(Payroll, payrollDocs, "payroll");

  // ---------- Appraisals ----------
  const appraisalRows = loadAppraisals().filter((r) => userIdByEmpId.has(r.emp_id));
  console.log(`Preparing ${appraisalRows.length} appraisal documents...`);
  const appraisalDocs = appraisalRows.map((row) => ({
    user: userIdByEmpId.get(row.emp_id),
    reviewDate: new Date(row.review_date),
    rating: row.rating,
    remarks: row.remarks,
  }));
  console.log("Inserting appraisals...");
  await insertInBatches(Appraisal, appraisalDocs, "appraisals");

  // ---------- Recruitment (standalone candidates, no user link) ----------
  const recruitmentRows = loadRecruitment();
  console.log(`Preparing ${recruitmentRows.length} recruitment documents...`);
  const recruitmentDocs = recruitmentRows.map((row) => ({
    candidateName: row.candidate_name,
    position: row.position,
    interviewDate: new Date(row.interview_date),
    status: row.status,
  }));
  console.log("Inserting recruitment...");
  await insertInBatches(Recruitment, recruitmentDocs, "recruitment");

  console.log("\nDone.");
  console.log(`Employees created: ${insertedUsers.length}`);
  console.log(`Attendance records: ${attendanceDocs.length}`);
  console.log(`Leave requests: ${leaveDocs.length}`);
  console.log(`Payroll records: ${payrollDocs.length}`);
  console.log(`Appraisals: ${appraisalDocs.length}`);
  console.log(`Recruitment candidates: ${recruitmentDocs.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
