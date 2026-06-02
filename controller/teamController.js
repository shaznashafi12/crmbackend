import User from "../models/User.js";
import bcrypt from "bcrypt";

export const getTeam = async (req, res) => {
  const users = await User.find({ companyId: req.user.companyId });
  res.json({ success: true, data: users });
};

export const addMember = async (req, res) => {
  const { name, email, password, role } = req.body;

const member = await User.create({ ...data, password });

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    companyId: req.user.companyId,
  });

  res.json({ success: true, data: user });
};

export const deleteMember = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};