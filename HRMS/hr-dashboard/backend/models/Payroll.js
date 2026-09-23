const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String, // e.g. "2026-08"
      required: true,
    },
    basic: { type: Number, required: true },
    allowances: { type: Number, required: true },
    deductions: { type: Number, required: true },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid",
    },
    paidOn: { type: Date, default: null },
  },
  { timestamps: true }
);

PayrollSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", PayrollSchema);
