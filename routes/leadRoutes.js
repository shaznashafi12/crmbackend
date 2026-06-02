import express from "express";
import { getLeads, createLead, convertLead, updateLead, deleteLead } from "../controller/leadController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.post("/:id/convert", protect, convertLead);
router.delete("/:id", protect, deleteLead);
router.put("/:id",protect, updateLead);
export default router;