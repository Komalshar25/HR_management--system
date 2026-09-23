const mongoose = require("mongoose");
const Kudos = require("../models/Kudos");
const User = require("../models/User");

const PUBLIC_USER_FIELDS = "name department designation employeeId";
const DAILY_KUDOS_LIMIT = 20;

const monthStart = (offset = 0) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + offset, 1);
};

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const topReceivers = async (from, to, limit) => {
  const rows = await Kudos.aggregate([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: "$to", count: { $sum: 1 }, latest: { $max: "$createdAt" } } },
    { $sort: { count: -1, latest: -1 } },
    { $limit: limit },
  ]);
  const users = await User.find({ _id: { $in: rows.map((r) => r._id) } })
    .select(PUBLIC_USER_FIELDS)
    .lean();
  const byId = new Map(users.map((u) => [u._id.toString(), u]));
  return rows
    .filter((r) => byId.has(r._id.toString()))
    .map((r) => ({ user: byId.get(r._id.toString()), count: r.count }));
};

exports.giveKudos = async (req, res) => {
  try {
    const { to, badge, message } = req.body;
    const text = typeof message === "string" ? message.trim() : "";

    if (!to || !mongoose.isValidObjectId(to)) {
      return res.status(400).json({ message: "Choose a colleague to recognise" });
    }
    if (!text || text.length > 280) {
      return res.status(400).json({ message: "Message is required (max 280 characters)" });
    }
    if (String(to) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot give kudos to yourself" });
    }
    if (badge && !Kudos.BADGES.includes(badge)) {
      return res.status(400).json({ message: "Invalid badge" });
    }

    const recipient = await User.findById(to).select("_id");
    if (!recipient) {
      return res.status(404).json({ message: "Colleague not found" });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sentToday = await Kudos.countDocuments({ from: req.user.id, createdAt: { $gte: since } });
    if (sentToday >= DAILY_KUDOS_LIMIT) {
      return res.status(429).json({ message: "Daily kudos limit reached, try again tomorrow" });
    }

    const kudos = await Kudos.create({ from: req.user.id, to, badge, message: text });
    const populated = await Kudos.findById(kudos._id)
      .populate("from", PUBLIC_USER_FIELDS)
      .populate("to", PUBLIC_USER_FIELDS);
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send kudos" });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const kudos = await Kudos.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("from", PUBLIC_USER_FIELDS)
      .populate("to", PUBLIC_USER_FIELDS);
    res.json(kudos.filter((k) => k.from && k.to));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load kudos" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const thisMonth = monthStart(0);
    const lastMonth = monthStart(-1);
    const nextMonth = monthStart(1);

    const [leaders, lastMonthTop] = await Promise.all([
      topReceivers(thisMonth, nextMonth, 5),
      topReceivers(lastMonth, thisMonth, 1),
    ]);

    res.json({
      month: monthKey(thisMonth),
      leaders,
      lastMonth: monthKey(lastMonth),
      lastMonthWinner: lastMonthTop[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
};

exports.getForUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const [kudos, total] = await Promise.all([
      Kudos.find({ to: req.params.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("from", PUBLIC_USER_FIELDS),
      Kudos.countDocuments({ to: req.params.id }),
    ]);
    res.json({ total, kudos: kudos.filter((k) => k.from) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load kudos" });
  }
};
