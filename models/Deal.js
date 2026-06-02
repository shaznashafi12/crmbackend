import mongoose from "mongoose";


const dealSchema = new mongoose.Schema({
  title: String,
  contactName: String,
  contactEmail: String,
  value: Number,
  stage: { type: String, default: "open" },
  notes: String,
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" }, // ✅ ADD THIS
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
}, { timestamps: true });

export default mongoose.model("Deal", dealSchema);