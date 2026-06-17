import Company from "../models/Company.js";
import User from "../models/User.js";

export const createCompany = async (req, res) => {
  try {
    const { name, subscription } = req.body;

    const company = await Company.create({ name, subscription });

    res.status(201).json({ success: true, data: company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create company" });
  }
};

export const getMetrics = async (req, res) => {
  try {
    const companies = await Company.find();

    const companiesWithMetrics = await Promise.all(
      companies.map(async (company) => {
        const users = await User.countDocuments({ companyId: company._id });

        return {
          id: company._id.toString(),
          name: company.name,
          subscription: company.subscription,
          createdAt: company.createdAt,
          metrics: { users, leads: 0, deals: 0 },
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
};

// ✅ Fixed: company lookup happens BEFORE the null check
// ✅ REPLACE updateSubscription — null check was before the DB call
export const updateSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    const company = await Company.findByIdAndUpdate(  // fetch FIRST
      req.params.id,
      { subscription },
      { new: true }
    );

    if (!company) {                                    // THEN null-check
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update subscription" });
  }
};
export const updateCompany = async (req, res) => {
  try {
    const { name, subscription } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(subscription && { subscription }) },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, data: company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to update company" });
  }
};

// ✅ New: handles DELETE /companies/:id
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to delete company" });
  }
};