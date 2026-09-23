const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");
const User = require("../models/User");

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 7;

exports.list = async (req, res) => {
  try {
    const items = await Announcement.find()
      .sort({ pinned: -1, createdAt: -1 })
      .limit(10)
      .populate("author", "name");
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load announcements" });
  }
};

exports.create = async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
    if (!title || title.length > 120) {
      return res.status(400).json({ message: "Title is required (max 120 characters)" });
    }
    if (!body || body.length > 1000) {
      return res.status(400).json({ message: "Message is required (max 1000 characters)" });
    }

    const item = await Announcement.create({
      title,
      body,
      pinned: Boolean(req.body.pinned),
      author: req.user.id,
    });
    res.status(201).json(await item.populate("author", "name"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post announcement" });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

// Birthdays and work anniversaries happening in the next WINDOW_DAYS days (today included).
exports.celebrations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Next calendar occurrence (>= today) of the month/day of `date`.
    const nextOccurrence = (date) => {
      const d = new Date(date);
      const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return next;
    };

    const users = await User.find()
      .select("name department dateOfBirth createdAt")
      .lean();

    const birthdays = [];
    const anniversaries = [];
    for (const u of users) {
      if (u.dateOfBirth) {
        const next = nextOccurrence(u.dateOfBirth);
        const daysUntil = Math.round((next - today) / DAY_MS);
        if (daysUntil < WINDOW_DAYS) {
          birthdays.push({ _id: u._id, name: u.name, department: u.department, daysUntil });
        }
      }
      if (u.createdAt) {
        const next = nextOccurrence(u.createdAt);
        const daysUntil = Math.round((next - today) / DAY_MS);
        const years = next.getFullYear() - new Date(u.createdAt).getFullYear();
        if (daysUntil < WINDOW_DAYS && years >= 1) {
          anniversaries.push({ _id: u._id, name: u.name, department: u.department, daysUntil, years });
        }
      }
    }

    const soonest = (a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name);
    res.json({
      birthdays: birthdays.sort(soonest).slice(0, 8),
      anniversaries: anniversaries.sort((a, b) => a.daysUntil - b.daysUntil || b.years - a.years).slice(0, 8),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load celebrations" });
  }
};
