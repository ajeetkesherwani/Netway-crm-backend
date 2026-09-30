const { getZiggTvSubscriberDetails, cancelZiggTvPack } = require("../../../services/ziggtvServices");

exports.getZiggtvDetails = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const data = await getZiggTvSubscriberDetails(phone);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ZiggTV details",
      error: error.message
    });
  }
};

exports.cancelZiggtvPackage = async (req, res) => {
  try {
    const { phone, planId, month } = req.body;
    if (!phone || !planId) {
      return res.status(400).json({ success: false, message: "Phone and planId are required" });
    }
    const data = await cancelZiggTvPack(phone, planId, month || "1");
    return res.status(200).json({ success: true, message: "Package cancelled successfully", data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel ZiggTV package",
      error: error.message
    });
  }
};
