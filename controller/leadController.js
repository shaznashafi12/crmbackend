import Lead from "../models/Lead.js";
import Deal from "../models/Deal.js";

export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { companyId: req.user.companyId };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const term = req.query.search.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { contactName: { $regex: term, $options: "i" } },
        { contactEmail: { $regex: term, $options: "i" } },
      ];
    }

    const totalLeads = await Lead.countDocuments(query);

    const leads = await Lead.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leads,
      totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
      page,
    });
  } catch (err) {
    console.error("getLeads error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
};

export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      companyId: req.user.companyId,
    });

    res.json({ success: true, data: lead });
  } catch (err) {
    console.error("createLead error:", err);
    res.status(500).json({ success: false, message: "Failed to create lead" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true, data: lead });
  } catch (err) {
    console.error("updateLead error:", err);
    res.status(500).json({ success: false, message: "Failed to update lead" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("deleteLead error:", err);
    res.status(500).json({ success: false, message: "Failed to delete lead" });
  }
};

export const convertLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (lead.status === "qualified") {
      return res.status(400).json({
        success: false,
        message: "Lead has already been converted to a deal",
      });
    }

    const deal = await Deal.create({
      title: lead.title,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      value: lead.value,
      notes: lead.notes,
      companyId: lead.companyId,
      stage: "proposal",
    });

    lead.status = "qualified";
    await lead.save();

    res.json({ success: true, data: deal, message: "Lead converted to deal successfully" });
  } catch (err) {
    console.error("convertLead error:", err);
    res.status(500).json({ success: false, message: "Conversion failed" });
  }
};