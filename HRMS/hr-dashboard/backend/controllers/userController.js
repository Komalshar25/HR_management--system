const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateEmployeeId } = require("./authController");

const VALID_ROLES = ["Employee", "Manager", "HR", "Admin"];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -baseSalary").sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 50) : "";
    if (q.length < 2) return res.json([]);

    const rx = new RegExp(escapeRegex(q), "i");
    const users = await User.find({ $or: [{ name: rx }, { employeeId: rx }] })
      .select("name employeeId department designation")
      .sort({ name: 1 })
      .limit(10)
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -baseSalary");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeId = await generateEmployeeId();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: VALID_ROLES.includes(role) ? role : "Employee",
      employeeId,
      ...(department && { department }),
      ...(designation && { designation }),
    });

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, department, designation, dateOfBirth } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (department) updates.department = department;
    if (designation) updates.designation = designation;

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === "" || dateOfBirth === null) {
        updates.dateOfBirth = null;
      } else {
        const dob = new Date(dateOfBirth);
        if (Number.isNaN(dob.getTime()) || dob > new Date() || dob.getFullYear() < 1900) {
          return res.status(400).json({ message: "Enter a valid date of birth" });
        }
        updates.dateOfBirth = dob;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password -baseSalary");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
