const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      required: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true
    },

    comment: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Approval", approvalSchema);
