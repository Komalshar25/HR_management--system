const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateEmployeeId = async () => {
  const employees = await User.find({ employeeId: /^EMP-\d+$/ }).select(
    "employeeId"
  );

  const lastNumber = employees.reduce((max, u) => {
    const n = parseInt(u.employeeId.slice(4), 10);
    return n > max ? n : max;
  }, 1000);

  return `EMP-${lastNumber + 1}`;
};

exports.generateEmployeeId = generateEmployeeId;

exports.register = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeId = await generateEmployeeId();

    const user = new User({
      name: String(name).trim(),
      email,
      password: hashedPassword,
      role: "Employee",
      employeeId,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      token,
      ...userObj,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      token,
      ...userObj,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};