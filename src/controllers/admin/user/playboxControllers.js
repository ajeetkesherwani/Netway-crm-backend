const { getPlayboxUserDetails } = require("../../../services/playboxServices");

exports.getPlayboxDetails = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const data = await getPlayboxUserDetails(phone);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch PlayBoxTV details",
      error: error.message
    });
  }
};
