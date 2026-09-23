// Gives every employee a standard onboarding document set (metadata only — there are no
// real files behind these, since this is imported/seeded HR data, not actual uploads).
// Re-runnable: only touches users who have no Document records yet.

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Document = require("../models/Document");

const BATCH_SIZE = 500;

const DOC_TEMPLATES = [
  { name: "Offer Letter.pdf", type: "Offer Letter" },
  { name: "Resume.pdf", type: "Resume" },
  { name: "ID Proof.pdf", type: "ID Proof" },
];

const insertInBatches = async (docs) => {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Document.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`  documents: ${inserted}/${docs.length}`);
  }
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const allUsers = await User.find().select("createdAt");
  const usersWithDocs = new Set((await Document.distinct("user")).map(String));
  const missing = allUsers.filter((u) => !usersWithDocs.has(u._id.toString()));

  console.log(`Seeding documents for ${missing.length} employees (${DOC_TEMPLATES.length} each)...`);
  const docs = [];
  for (const user of missing) {
    const uploadedAt = user.createdAt ? new Date(user.createdAt) : new Date();
    for (const tmpl of DOC_TEMPLATES) {
      docs.push({
        user: user._id,
        name: tmpl.name,
        type: tmpl.type,
        status: "Verified",
        uploadedAt,
      });
    }
  }
  await insertInBatches(docs);

  console.log(`\nDone. Document records added: ${docs.length} (for ${missing.length} employees)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
