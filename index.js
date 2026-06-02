import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/companies", companyRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/team", teamRoutes);
const PORT = process.env.PORT || 4000;

connectDB().then(() => console.log("MongoDB connected"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});