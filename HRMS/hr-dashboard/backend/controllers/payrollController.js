const Payroll = require("../models/Payroll");
const User = require("../models/User");

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthsBack = (count) => {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  return months;
};

const baseSalaryFor = (user) => {
  if (typeof user.baseSalary === "number" && user.baseSalary > 0) return user.baseSalary;
  const seed = String(user.employeeId || user.id).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 45000 + (seed % 20) * 2500;
};

const ensurePayrollHistory = async (user) => {
  const existing = await Payroll.find({ user: user.id }).sort({ month: 1 });
  const existingMonths = new Set(existing.map((p) => p.month));
  const basic = baseSalaryFor(user);
  const currentMonth = monthKey(new Date());

  const toCreate = monthsBack(6)
    .filter((month) => !existingMonths.has(month))
    .map((month) => {
      const isCurrentMonth = month === currentMonth;
      const allowances = Math.round(basic * 0.25);
      const deductions = Math.round(basic * 0.12);
      return {
        user: user.id,
        month,
        basic,
        allowances,
        deductions,
        netPay: basic + allowances - deductions,
        status: isCurrentMonth ? "Pending" : "Paid",
        paidOn: isCurrentMonth ? null : new Date(`${month}-28`),
      };
    });

  if (toCreate.length > 0) {
    await Payroll.insertMany(toCreate);
  }

  return Payroll.find({ user: user.id }).sort({ month: -1 });
};

exports.getMyPayroll = async (req, res) => {
  try {
    const records = await ensurePayrollHistory(req.user);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payroll" });
  }
};

exports.getPayrollSummary = async (req, res) => {
  try {
    // Report on whichever month has the most payroll coverage, rather than assuming the
    // calendar's current month has data (imported datasets are historical) or lazily
    // generating history for every employee here (doesn't scale past a handful of users).
    const coverage = await Payroll.aggregate([
      { $group: { _id: "$month", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: -1 } },
      { $limit: 1 },
    ]);
    if (!coverage.length) {
      return res.json({ month: null, totalNetPay: 0, employeeCount: 0 });
    }

    const month = coverage[0]._id;
    const validUserIds = new Set((await User.find().select("_id")).map((u) => u._id.toString()));
    const records = (await Payroll.find({ month })).filter((r) => validUserIds.has(r.user.toString()));
    const totalNetPay = records.reduce((sum, r) => sum + r.netPay, 0);

    res.json({ month, totalNetPay, employeeCount: records.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute payroll summary" });
  }
};

exports.getPayrollByUser = async (req, res) => {
  try {
    const records = await Payroll.find({ user: req.params.id }).sort({ month: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payroll" });
  }
};

exports.getAllPayroll = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {};
    if (month) filter.month = month;

    const records = await Payroll.find(filter)
      .populate("user", "name email employeeId department designation")
      .sort({ month: -1 });

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payroll" });
  }
};
