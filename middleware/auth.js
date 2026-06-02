// middleware/auth.js
// Drop-in replacement — adds isSuperAdmin middleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Super Admin access required" });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};