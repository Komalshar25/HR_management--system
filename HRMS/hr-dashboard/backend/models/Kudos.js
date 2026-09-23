const mongoose = require("mongoose");

const BADGES = ["Team Player", "Above & Beyond", "Problem Solver", "Great Mentor", "Innovator"];

const KudosSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    badge: { type: String, enum: BADGES, default: "Team Player" },
    message: { type: String, required: true, trim: true, maxlength: 280 },
  },
  { timestamps: true }
);

KudosSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Kudos", KudosSchema);
module.exports.BADGES = BADGES;
