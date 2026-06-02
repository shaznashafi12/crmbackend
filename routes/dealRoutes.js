import express from "express";
import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../controller/dealController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getDeals);

router.post("/", protect, createDeal);

router.put("/:id", protect, updateDeal);

router.delete("/:id", protect, deleteDeal);

export default router;