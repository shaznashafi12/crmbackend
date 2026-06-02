import express from "express";
import User    from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
const users = await User.find({
  companyId: req.user.companyId,
  role: "user"
}).select("-password");
  res.json({ success: true, data: users });
});
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }


const user = await User.create({
  name,
  email: email.toLowerCase().trim(),
  password,                          // ✅ plain text — pre-save hook hashes it once
  role: role || "user",
  companyId: req.user.companyId,
});
    const { password: _omit, ...safeUser } = user.toObject();

    res.status(201).json({ success: true, data: safeUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create team member." });
  }
});
router.delete("/:id", protect, async (req, res) => {
    try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Member removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member." });
  }
});

export default router;