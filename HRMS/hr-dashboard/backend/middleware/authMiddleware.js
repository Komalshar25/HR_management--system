const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      employeeId: user.employeeId,
      baseSalary: user.baseSalary,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Not authorized" });
  }
};