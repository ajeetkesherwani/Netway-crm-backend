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

      const ips = await getIpacctPoolFreeIpsList(resolved.id, count);

      return res.status(200).json({
        status: true,
        message: `Free IP(s) retrieved successfully for pool ${resolved.name || resolved.id}`,
        data: {
          poolId: resolved.id,
          poolName: resolved.name || `Pool ${resolved.id}`,
          zoneId: resolved.zoneid,
          ip: ips[0] || "",
          ips: ips,
          count: ips.length,
          requestedCount: count
        }
      });
    }

    // Case 2: No specific pool passed -> fetch free IPs for all available pools
    const allPools = await getIpacctPoolsList();
    const results = [];

    for (const p of allPools) {
      const ips = await getIpacctPoolFreeIpsList(p.id, count);
      results.push({
        poolId: p.id,
        poolName: p.name,
        zoneId: p.zoneid,
        ip: ips[0] || "",
        ips: ips,
        count: ips.length
      });
    }

    return res.status(200).json({
      status: true,
      message: "Free IP(s) retrieved successfully for all available pools",
      totalPools: results.length,
      data: results
    });
  } catch (error) {
    console.error("Error in getPoolIpsController:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch free IP(s) for pool from IPACCT",
      error: error.message
    });
  }
};
