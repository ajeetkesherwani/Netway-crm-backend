const User = require("../../../models/user");
const { getIpacctUser } = require("../../../services/ipacctUserServices");

exports.syncUserIpFromIpacct = async (req, res) => {
  try {
    const { userId, ipacctId } = req.body;
    
    // Find the user in MongoDB
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (ipacctId) {
      user = await User.findOne({ "generalInformation.ipacctCustomerId": String(ipacctId) });
    }

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found in CRM" });
    }

    const actualIpacctId = user.generalInformation?.ipacctCustomerId || ipacctId;

    if (!actualIpacctId) {
       return res.status(400).json({ status: false, message: "No IPACCT ID found for this user" });
    }

    // Call IPACCT API
    const ipacctRes = await getIpacctUser(actualIpacctId);
    if (!ipacctRes || !ipacctRes.found || !ipacctRes.userData) {
      return res.status(400).json({ status: false, message: "User not found in IPACCT" });
    }

    // Extract IP
    let newIp = "";
    const ips = ipacctRes.userData.ips?.item;
    if (Array.isArray(ips)) {
      newIp = ips[0]?.ip;
    } else if (ips && ips.ip) {
      newIp = ips.ip;
    }

    if (!newIp) {
      return res.status(400).json({ status: false, message: "No IP assigned to this user in IPACCT" });
    }

    // Update in CRM
    user.generalInformation.ipAdress = newIp;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "User IP synced successfully from IPACCT",
      ip: newIp
    });

  } catch (error) {
    console.error("Error syncing IP:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal server error" });
  }
};
