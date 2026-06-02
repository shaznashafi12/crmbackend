import Deal from "../models/Deal.js";

export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({
      companyId: req.user.companyId,
    }).populate("leadId");

    res.json({ success: true, data: deals });
  } catch (err) {
    console.error(err);
    // FIXED: return success:false so frontend error handler catches it properly
    res.status(500).json({ success: false, message: "Failed to fetch deals" });
  }
};

export const createDeal = async (req, res) => {
  try {
    const deal = await Deal.create({
      ...req.body,
      companyId: req.user.companyId,
    });

    const populated = await deal.populate("leadId");

    res.json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create deal" });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id },        
      req.body,
      { new: true }
    ).populate("leadId");

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    res.json({ success: true, data: deal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update deal" });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id });  // <-- was: { _id, companyId }

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete deal" });
  }
};