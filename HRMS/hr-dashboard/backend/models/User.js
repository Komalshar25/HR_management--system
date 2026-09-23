const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Employee", "Manager", "HR", "Admin"],
      default: "Employee",
    },

    employeeId: {
      type: String,
      unique: true,
      required: true,
    },

    department: {
      type: String,
      default: "Engineering",
    },

    designation: {
      type: String,
      default: "Software Developer",
    },

    baseSalary: {
      type: Number,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);