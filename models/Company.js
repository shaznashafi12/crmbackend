import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    subscription: { type: String, default: "free", enum: ["free", "premium", "enterprise"] },
  },
  { timestamps: true }   
);

export default mongoose.model("Company", companySchema);