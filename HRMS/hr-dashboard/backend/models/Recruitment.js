const mongoose = require("mongoose");

const RecruitmentSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Selected", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruitment", RecruitmentSchema);
