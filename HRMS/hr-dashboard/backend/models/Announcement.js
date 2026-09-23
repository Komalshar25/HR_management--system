const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ pinned: -1, createdAt: -1 });

module.exports = mongoose.model("Announcement", AnnouncementSchema);
