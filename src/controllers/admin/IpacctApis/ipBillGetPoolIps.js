const User = require("../../../models/user");
const {
  resolvePoolDynamic,
  getIpacctPoolsList,
  getIpacctPoolFreeIpsList
} = require("../../../services/ipacctUserServices");

/**
 * Controller to fetch free/available IP(s) for any pool from IPACCT.
 *
 * Supported inputs (via Query params, URL path params, or JSON Body):
 *  - poolId / pool / id: (e.g. 1, 2, "NOIDA-POOL", "TEST 100.64.40.1/24")
 *  - zoneId / zoneid: (e.g. 1, 3)
 *  - count: number of free IPs to fetch (default: 1)
 *
 * If no poolId/zoneId is passed, returns free IPs for ALL available pools in IPACCT.
 */
exports.getPoolIpsController = async (req, res) => {
  try {
    const poolParam = req.params?.poolId || req.params?.id;
    const poolInput = poolParam !== undefined ? poolParam : (req.query?.poolId || req.query?.pool || req.query?.id || req.body?.poolId || req.body?.pool || req.body?.id || "");
    const zoneIdInput = req.query?.zoneId || req.query?.zoneid || req.body?.zoneId || req.body?.zoneid || "";
    const countInput = req.query?.count || req.body?.count || 1;
    const count = Math.max(1, parseInt(countInput, 10) || 1);

    const zoneId = zoneIdInput !== "" && !isNaN(zoneIdInput) ? parseInt(zoneIdInput, 10) : undefined;

    // Case 1: Specific pool or zone requested
    if (poolInput || zoneId !== undefined) {
      let resolved = await resolvePoolDynamic(poolInput, zoneId);

      // Fallback if poolInput is a numeric ID directly
      if (!resolved && poolInput && !isNaN(poolInput)) {
        resolved = { id: parseInt(poolInput, 10), name: "", zoneid: zoneId };
      }

      if (!resolved || !resolved.id) {
        const allPools = await getIpacctPoolsList();
        return res.status(404).json({
          status: false,
          message: `Pool "${poolInput || zoneId}" not found.`,
          availablePools: allPools
        });
      }

      const freeIpsFromIpacct = await getIpacctPoolFreeIpsList(resolved.id, count);
      
      // Get assigned IPs from the CRM database for this pool
      // User model stores pool as String, it could be the name or ID. We can search for both just in case.
      const poolSearchCriteria = [
        { "generalInformation.pool": String(resolved.id) },
        { "generalInformation.pool": resolved.name }
      ];
      if (poolInput) {
         poolSearchCriteria.push({ "generalInformation.pool": String(poolInput) });
      }

      const assignedUsers = await User.find({
        $or: poolSearchCriteria,
        "generalInformation.ipAdress": { $exists: true, $ne: "" }
      }).select("generalInformation.ipAdress").lean();

      const assignedIps = new Set(assignedUsers.map(u => u.generalInformation?.ipAdress));
      
      const allIpsMap = new Map();
      
      // Add assigned IPs (unavailable)
      for (const ip of assignedIps) {
        allIpsMap.set(ip, { ip, available: false });
      }
      
      // Add free IPs from IPACCT (available) - unless already in DB
      for (const ip of freeIpsFromIpacct) {
        if (!allIpsMap.has(ip)) {
          allIpsMap.set(ip, { ip, available: true });
        }
      }
      
      const combinedIpsList = Array.from(allIpsMap.values());

      return res.status(200).json({
        status: true,
        message: `IP(s) retrieved successfully for pool ${resolved.name || resolved.id}`,
        data: {
          poolId: resolved.id,
          poolName: resolved.name || `Pool ${resolved.id}`,
          zoneId: resolved.zoneid,
          ip: freeIpsFromIpacct[0] || (combinedIpsList[0] ? combinedIpsList[0].ip : ""),
          ips: combinedIpsList,
          count: combinedIpsList.length,
          requestedCount: count
        }
      });
    }

    // Case 2: No specific pool passed -> fetch IPs for all available pools
    const allPools = await getIpacctPoolsList();
    const results = [];
    
    // For all pools, we just fetch all assigned IPs once
    const allAssignedUsers = await User.find({
      "generalInformation.ipAdress": { $exists: true, $ne: "" }
    }).select("generalInformation.ipAdress generalInformation.pool").lean();

    for (const p of allPools) {
      const freeIpsFromIpacct = await getIpacctPoolFreeIpsList(p.id, count);
      
      // Filter DB assigned IPs by this pool (id or name)
      const poolAssignedIps = new Set(
        allAssignedUsers
          .filter(u => u.generalInformation?.pool === String(p.id) || u.generalInformation?.pool === p.name)
          .map(u => u.generalInformation?.ipAdress)
      );

      const allIpsMap = new Map();
      for (const ip of poolAssignedIps) {
        allIpsMap.set(ip, { ip, available: false });
      }
      for (const ip of freeIpsFromIpacct) {
        if (!allIpsMap.has(ip)) {
          allIpsMap.set(ip, { ip, available: true });
        }
      }
      const combinedIpsList = Array.from(allIpsMap.values());

      results.push({
        poolId: p.id,
        poolName: p.name,
        zoneId: p.zoneid,
        ip: freeIpsFromIpacct[0] || (combinedIpsList[0] ? combinedIpsList[0].ip : ""),
        ips: combinedIpsList,
        count: combinedIpsList.length
      });
    }

    return res.status(200).json({
      status: true,
      message: "IP(s) retrieved successfully for all available pools",
      totalPools: results.length,
      data: results
    });
  } catch (error) {
    console.error("Error in getPoolIpsController:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch IP(s) for pool",
      error: error.message
    });
  }
};
