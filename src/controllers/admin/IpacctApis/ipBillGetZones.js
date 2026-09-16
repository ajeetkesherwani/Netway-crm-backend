const { callSoap } = require("../../../utils/soapApi");
const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");

exports.syncIpacctZones = async (req, res, next) => {
  try {
    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
    };

    console.log("Fetching zones from IPACCT...");
    const response = await callSoap("ipbillGetZones", params);
    
    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    const returnData = body?.["ns1:ipbillGetZonesResponse"]?.return;
    
    if (!returnData || !returnData.item) {
      return res.status(200).json({
        status: "success",
        message: "No zones found from IPACCT API.",
      });
    }

    let zonesList = returnData.item;
    // If there's only one zone, it might be an object instead of array
    if (!Array.isArray(zonesList)) {
      zonesList = [zonesList];
    }

    let syncedCount = 0;
    let syncedZonesData = [];
    
    for (let ipacctZone of zonesList) {
      const zoneId = parseInt(ipacctZone.id?._ || ipacctZone.id, 10);
      const zoneName = ipacctZone.name?._ || ipacctZone.name || "";

      if (!isNaN(zoneId) && zoneName) {
        // Try to update existing zone by exact name match first
        let localZone = await Zone.findOne({ zoneName: zoneName });
        
        if (localZone) {
          localZone.ipacctZoneId = zoneId;
          await localZone.save();
        } else {
          // If not exists, create a new zone mapping
          localZone = await Zone.create({
            zoneName: zoneName,
            ipacctZoneId: zoneId,
            createdBy: "Admin" // default
          });
        }
        syncedZonesData.push(localZone);
        syncedCount++;
      }
    }

    res.status(200).json({
      status: "success",
      message: `Successfully synced ${syncedCount} zones from IPACCT.`,
      data: syncedZonesData
    });
  } catch (error) {
    console.error("Error syncing IPACCT zones:", error.message);
    next(new AppError("Failed to sync IPACCT zones: " + error.message, 500));
  }
};
