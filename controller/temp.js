import User from "../models/User.js";
import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const genToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
export const register = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const company = await Company.create({ name: companyName || "Default" });

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      companyId: company._id,
    });

    res.json({
token: genToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: company._id,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    companyId: user.companyId,
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user._id).populate("companyId");
  res.json({ success: true, data: user });
};

export const createAdminForCompany = async (req, res) => {
try {
const { name, email, password, companyId } = req.body;

if (!name || !email || !password || !companyId) {
  return res.status(400).json({
    success: false,
    message: "All fields are required",
  });
}

const existingUser = await User.findOne({ email });

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "User already exists",
  });
}

const company = await Company.findById(companyId);

if (!company) {
  return res.status(404).json({
    success: false,
    message: "Company not found",
  });
}
const admin = await User.create({
  name,
  email,
  password,
  role: "admin",
companyId: companyId
});

res.status(201).json({
  success: true,
  message: "Admin created successfully",
  data: admin,
});

} catch (error) {
console.log("CREATE ADMIN ERROR:", error);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "superadmin" } })
      .select("-password")
      .populate("companyId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};