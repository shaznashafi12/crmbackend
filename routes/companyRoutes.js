import express from "express";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { isAdmin, isSuperAdmin, protect } from "../middleware/auth.js";
import Lead from "../models/Lead.js";
import Deal from "../models/Deal.js";

const router = express.Router();
// ✅ ADD THIS ROUTE (TOP of file, before "/:id")

router.get("/metrics", protect, isSuperAdmin, async (req, res) => {
  try {
    const companies = await Company.find();

    const companiesWithMetrics = await Promise.all(
      companies.map(async (c) => {
        const users = await User.countDocuments({ company: c._id });
        const leads = await Lead.countDocuments({ company: c._id });
        const deals = await Deal.countDocuments({ company: c._id });

        return {
          id: c._id.toString(),
          name: c.name,
          subscription: c.subscription,
          createdAt: c.createdAt,
          metrics: { users, leads, deals },
        };
      })
    );

    const aggregates = {
      totalCompanies: companies.length,
      totalUsers: companiesWithMetrics.reduce((a, c) => a + c.metrics.users, 0),
      totalLeads: companiesWithMetrics.reduce((a, c) => a + c.metrics.leads, 0),
      totalDeals: companiesWithMetrics.reduce((a, c) => a + c.metrics.deals, 0),
    };

    res.json({
      success: true,
      data: {
        aggregates,
        companies: companiesWithMetrics,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/my-company", protect, async (req, res) => {
  try {
    console.log("USER:", req.user);
    const company = await Company.findById(req.user.companyId).select("name subscription");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json({ success: true, data: company });
    console.log("COMPANY:", company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company" });
  }
});

router.get("/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      success: true,
      data: company,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch company" });
  }
});

router.post("/", protect, isSuperAdmin, async (req, res) => {
  try {
    const { name, subscription } = req.body;

    const company = await Company.create({
      name,
      subscription,
    });

    res.status(201).json({
      success: true,
      data: company,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create company" });
  }
});

router.put("/:id/subscription", protect, isSuperAdmin, async (req, res) => {
  try {
    const { subscription } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { subscription },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: company });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update subscription" });
  }
});

router.put("/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    console.log("EDIT ID:", req.params.id); // 👈 ADD THIS

    const { name, subscription } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(subscription && { subscription }) },
      { new: true, runValidators: true }
    );

    if (!company) {
      console.log("❌ Company NOT FOUND"); // 👈 ADD
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, isSuperAdmin, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;