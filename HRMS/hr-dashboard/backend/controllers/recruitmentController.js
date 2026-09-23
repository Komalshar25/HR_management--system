const Recruitment = require("../models/Recruitment");

exports.getAllCandidates = async (req, res) => {
  try {
    const { status, position } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (position) filter.position = position;

    const candidates = await Recruitment.find(filter).sort({ interviewDate: -1 }).limit(500);
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const candidates = await Recruitment.find();
    const total = candidates.length;

    const byStatus = new Map();
    const byPosition = new Map();
    for (const c of candidates) {
      byStatus.set(c.status, (byStatus.get(c.status) || 0) + 1);
      if (!byPosition.has(c.position)) byPosition.set(c.position, { position: c.position, total: 0, selected: 0 });
      const entry = byPosition.get(c.position);
      entry.total += 1;
      if (c.status === "Selected") entry.selected += 1;
    }

    res.json({
      total,
      selected: byStatus.get("Selected") || 0,
      pending: byStatus.get("Pending") || 0,
      rejected: byStatus.get("Rejected") || 0,
      byPosition: Array.from(byPosition.values()).sort((a, b) => b.total - a.total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute recruitment summary" });
  }
};
