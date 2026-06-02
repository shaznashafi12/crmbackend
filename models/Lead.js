import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: "new" },

  contactName: String,
  contactEmail: String,
  value: { type: Number, default: 0 },
  notes: String,

  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
}, { timestamps: true });

export default mongoose.model("Lead", leadSchema);