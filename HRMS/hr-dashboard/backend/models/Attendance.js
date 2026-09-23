const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave"],
      default: "Present",
    },
    hoursWorked: {
      type: Number,
      default: 0, // milliseconds
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);