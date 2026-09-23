// Adds payroll (Jan-Apr 2026) and one appraisal for every employee who has none.
// Safe to re-run.

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Payroll = require("../models/Payroll");
const Appraisal = require("../models/Appraisal");

const BATCH_SIZE = 500;
const PAYROLL_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"];
const REMARKS = ["Excellent", "Good", "Average", "Needs Improvement"];

const lastDayOf = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0);
};

const seedFor = (str) => String(str).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

const baseSalaryFor = (user) => {
  if (typeof user.baseSalary === "number" && user.baseSalary > 0) return user.baseSalary;
  const seed = seedFor(user.employeeId || user._id);
  return 45000 + (seed % 20) * 2500;
};

const insertInBatches = async (Model, docs, label) => {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Model.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`  ${label}: ${inserted}/${docs.length}`);
  }
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const allUsers = await User.find().select("employeeId baseSalary createdAt");
  const payrollUserIds = new Set((await Payroll.distinct("user")).map(String));
  const appraisalUserIds = new Set((await Appraisal.distinct("user")).map(String));

  const missingPayroll = allUsers.filter((u) => !payrollUserIds.has(u._id.toString()));
  const missingAppraisal = allUsers.filter((u) => !appraisalUserIds.has(u._id.toString()));

  console.log(`Backfilling payroll for ${missingPayroll.length} employees...`);
  const payrollDocs = [];
  for (const user of missingPayroll) {
    const basic = baseSalaryFor(user);
    const allowances = Math.round(basic * 0.25);
    for (const month of PAYROLL_MONTHS) {
      payrollDocs.push({
        user: user._id,
        month,
        basic,
        allowances,
        deductions: 0,
        netPay: basic + allowances,
        status: "Paid",
        paidOn: lastDayOf(month),
      });
    }
  }
  await insertInBatches(Payroll, payrollDocs, "payroll");

  console.log(`Backfilling appraisals for ${missingAppraisal.length} employees...`);
  const appraisalDocs = missingAppraisal.map((user) => {
    const seed = seedFor(user.employeeId || user._id.toString());
    const rating = (seed % 5) + 1;
    const remarks = REMARKS[(seed * 3) % REMARKS.length];
    const daysAgo = 30 + (seed % 500);
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() - daysAgo);
    return { user: user._id, reviewDate, rating, remarks };
  });
  await insertInBatches(Appraisal, appraisalDocs, "appraisals");

  console.log("\nDone.");
  console.log(`Payroll records added: ${payrollDocs.length} (for ${missingPayroll.length} employees)`);
  console.log(`Appraisal records added: ${appraisalDocs.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
