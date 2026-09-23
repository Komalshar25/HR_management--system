const Appraisal = require("../models/Appraisal");

exports.getMyAppraisals = async (req, res) => {
  try {
    const records = await Appraisal.find({ user: req.user.id }).sort({ reviewDate: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appraisals" });
  }
};

exports.getAllAppraisals = async (req, res) => {
  try {
    const records = await Appraisal.find()
      .populate("user", "name email employeeId department designation")
      .sort({ reviewDate: -1 })
      .limit(200);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appraisals" });
  }
};

exports.getAppraisalsByUser = async (req, res) => {
  try {
    const records = await Appraisal.find({ user: req.params.id }).sort({ reviewDate: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appraisals" });
  }
};

exports.getAppraisalSummary = async (req, res) => {
  try {
    const records = await Appraisal.find().populate("user", "department");
    const total = records.length;
    const avgRating = total ? records.reduce((s, r) => s + r.rating, 0) / total : 0;

    const byDepartment = new Map();
    const byRating = new Map();
    for (const r of records) {
      const dept = r.user?.department || "Unassigned";
      if (!byDepartment.has(dept)) byDepartment.set(dept, { department: dept, total: 0, sum: 0 });
      const entry = byDepartment.get(dept);
      entry.total += 1;
      entry.sum += r.rating;

      byRating.set(r.rating, (byRating.get(r.rating) || 0) + 1);
    }

    res.json({
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      byDepartment: Array.from(byDepartment.values()).map((d) => ({
        department: d.department,
        avgRating: Math.round((d.sum / d.total) * 10) / 10,
        total: d.total,
      })),
      byRating: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: byRating.get(rating) || 0 })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute appraisal summary" });
  }
};
