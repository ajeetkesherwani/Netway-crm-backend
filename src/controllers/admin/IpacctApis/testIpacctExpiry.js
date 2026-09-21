const { syncIpacctUserExpiry } = require("../../../services/ipacctUserServices");

exports.testIpacctExpiry = async (req, res) => {
  try {
    const { ipacctId, expiryDate } = req.body;

    if (!ipacctId || !expiryDate) {
      return res.status(400).json({ error: "ipacctId and expiryDate are required in the body" });
    }

    console.log(`Testing IPACCT expiry sync for ID: ${ipacctId} with date: ${expiryDate}`);

    // Call the function directly with test values
    const result = await syncIpacctUserExpiry(ipacctId, expiryDate);

    return res.status(200).json({
      message: "Test completed. Check console for exact XML payload.",
      ipacctResponse: result
    });
  } catch (error) {
    console.error("Test failed:", error);
    return res.status(500).json({ error: error.message });
  }
};
