const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Offer Letter", "ID Proof", "Resume", "Address Proof", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Verified", "Pending"],
      default: "Pending",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
