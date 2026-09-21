const {
  syncIpacctUserExpiry,
} = require("../../../services/ipacctUserServices");

/**
 * Controller to sync an IPACCT user's expiry date.
 * Expected payload: { ipacctId: "...", expiryDate: "YYYY-MM-DD" }
 */
exports.syncUserExpiryToIpacct = async (req, res) => {
  try {
    const { ipacctId, expiryDate } = req.body;

    if (!ipacctId || !expiryDate) {
      return res.status(400).json({
        error: "ipacctId and expiryDate are required in the body",
      });
    }

    console.log(
      `Syncing IPACCT expiry for ID: ${ipacctId} with date: ${expiryDate}`,
    );

    const result = await syncIpacctUserExpiry(ipacctId, expiryDate);

    if (result && result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({
      message: "Test completed. Check console for exact XML payload.",
      ipacctResponse: result,
    });
  } catch (error) {
    console.error("Expiry sync failed:", error);
    return res.status(500).json({ error: error.message });
  }
};
