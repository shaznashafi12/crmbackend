import express from "express";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { protect, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();


router.post("/", async (req, res) => {
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

router.get("/metrics", async (req, res) => {
  try {
    const companies = await Company.find();

    const companiesWithMetrics = await Promise.all(
      companies.map(async (company) => {
        const users = await User.countDocuments({ companyId: company._id });

        return {
          id: company._id,
          name: company.name,
          subscription: company.subscription,
          createdAt: company.createdAt,
          metrics: {
            users,
            leads: 0,  
            deals: 0,  
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        aggregates: {
          totalCompanies: companies.length,
          totalUsers: companiesWithMetrics.reduce((a, c) => a + c.metrics.users, 0),
          totalLeads: 0,
          totalDeals: 0,
        },
        companies: companiesWithMetrics,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});


router.put("/:id/subscription", async (req, res) => {
  try {
    const { subscription } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { subscription },
      { new: true }
    );

    res.json({ success: true, data: company });

  } catch (err) {
    res.status(500).json({ message: "Failed to update subscription" });
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
export default router;