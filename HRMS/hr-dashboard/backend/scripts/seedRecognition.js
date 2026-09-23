// Seeds SAMPLE data for the recognition wall and company feed:
//  - synthetic birthdays for dataset-seeded employees (the source dataset has none)
//  - a few announcements (authored by the first Admin)
//  - sample kudos spread over this and last month
// Re-runnable: each part only runs when its target is empty.
//
// Usage: node scripts/seedRecognition.js

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Kudos = require("../models/Kudos");
const Announcement = require("../models/Announcement");

const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MESSAGES = [
  "Thanks for jumping in to help us hit the deadline.",
  "Great job leading the client call today!",
  "Really appreciate how patiently you walked me through that process.",
  "Your fix saved the team hours of work. Thank you!",
  "Always positive and always willing to help. Thank you!",
  "Brilliant idea in the planning meeting, it changed our approach.",
  "Thanks for staying late to get the release out.",
  "You make onboarding new joiners feel effortless.",
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const rand = mulberry32(20260921);

  // ---- Birthdays (seeded employees only) ----
  const seeded = await User.find({ email: /@hrms\.dev$/, dateOfBirth: null }).select("_id");
  if (seeded.length) {
    const ops = seeded.map((u) => {
      const year = 1970 + Math.floor(rand() * 31); // 1970-2000
      const dayOfYear = Math.floor(rand() * 365);
      const dob = new Date(Date.UTC(year, 0, 1 + dayOfYear));
      return { updateOne: { filter: { _id: u._id }, update: { $set: { dateOfBirth: dob } } } };
    });
    for (let i = 0; i < ops.length; i += 500) {
      await User.bulkWrite(ops.slice(i, i + 500));
    }
    console.log(`Assigned sample birthdays to ${seeded.length} employees.`);
  } else {
    console.log("Birthdays: nothing to do.");
  }

  // ---- Announcements ----
  if ((await Announcement.countDocuments()) === 0) {
    const author = (await User.findOne({ role: "Admin" }).select("_id")) || (await User.findOne().select("_id"));
    await Announcement.insertMany([
      {
        title: "Welcome to the HR portal",
        body: "Check in daily, apply for leave, and recognise your teammates from the dashboard. Questions? Reach out to HR.",
        author: author._id,
        pinned: true,
      },
      {
        title: "Quarterly performance reviews open next week",
        body: "Managers will start appraisals on Monday. Please make sure your goals and achievements are up to date.",
        author: author._id,
      },
      {
        title: "Office closed for the upcoming public holiday",
        body: "The office will be closed for the public holiday. Remote work is available for urgent tasks only.",
        author: author._id,
      },
    ]);
    console.log("Created 3 sample announcements.");
  } else {
    console.log("Announcements: already present.");
  }

  // ---- Kudos ----
  if ((await Kudos.countDocuments()) === 0) {
    const pool = await User.aggregate([{ $match: { email: /@hrms\.dev$/ } }, { $sample: { size: 40 } }, { $project: { _id: 1 } }]);
    const ids = pool.map((p) => p._id);
    const badges = Kudos.BADGES;
    const now = Date.now();
    const docs = [];
    // a few clear "stars" so the leaderboard has a visible top
    const stars = ids.slice(0, 5);
    for (let i = 0; i < 70; i++) {
      const to = rand() < 0.55 ? stars[Math.floor(rand() * stars.length)] : ids[Math.floor(rand() * ids.length)];
      let from = ids[Math.floor(rand() * ids.length)];
      if (String(from) === String(to)) from = ids[(ids.indexOf(from) + 1) % ids.length];
      const daysAgo = rand() < 0.5 ? Math.floor(rand() * 20) : 30 + Math.floor(rand() * 25);
      const createdAt = new Date(now - daysAgo * 86400000 - Math.floor(rand() * 86400000));
      docs.push({
        from,
        to,
        badge: badges[Math.floor(rand() * badges.length)],
        message: MESSAGES[Math.floor(rand() * MESSAGES.length)],
        createdAt,
        updatedAt: createdAt,
      });
    }
    await Kudos.insertMany(docs, { timestamps: false });
    console.log(`Created ${docs.length} sample kudos.`);
  } else {
    console.log("Kudos: already present.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
