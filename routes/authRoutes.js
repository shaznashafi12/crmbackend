import express from "express";
import {
  register,
  login,
  getMe,
  createAdminForCompany,
  getAllUsers,
   updateUser,   
  deleteUser,
  updateMyProfile,                         
} from "../controller/authController.js";

import { protect, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/users/:id", protect, updateUser);
router.delete("/users/:id", protect, isSuperAdmin, deleteUser);
router.post(
  "/create-admin",
  protect,
  isSuperAdmin,
  createAdminForCompany
);
router.get(
  "/users",
  protect,
  isSuperAdmin,
  getAllUsers
);
router.put("/me", protect, updateMyProfile);
export default router;