const { listIpacctUsers } = require("../../../services/ipacctUserServices");

/**
 * Controller to fetch list of users from IPACCT server via SOAP (listUsers).
 * Supports filtering by:
 *   - zoneid (integer, default 0 for all zones)
 *   - packageid (integer, default 0 for all packages)
 *   - active ("yes" | "no" | "all", default "all")
 *   - ppp ("yes" | "no" | "all", default "all")
 *   - weblogin ("yes" | "no" | "all", default "all")
 *   - stopped ("stopped" | "started" | "auto" | "autook" | "autostop" | "autoshaped" | "warnperiod" | "graceperiod" | "havemsg" | "all", default "all")
 *
 * Also supports optional convenience parameters:
 *   - search / name / username (string match on user name or login)
 *   - mobile / phone (string match on phone or mobile)
 *   - ip (string match on IP address)
 *   - page & limit (optional pagination)
 *
 * Parameters can be sent in either query parameters (GET) or JSON request body (POST).
 */
exports.listIpacctUsersController = async (req, res) => {
  try {
    const filters = {
      ...req.query,
      ...req.body
    };

    const result = await listIpacctUsers(filters);

    let users = result.users || [];
    const totalCount = users.length;

    // Optional pagination if 'page' or 'limit' is supplied
    if (filters.limit) {
      const page = Math.max(1, parseInt(filters.page, 10) || 1);
      const limit = Math.max(1, parseInt(filters.limit, 10) || 20);
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      return res.status(200).json({
        status: true,
        message: "IPACCT users fetched successfully",
        filterApplied: result.filterApplied,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        count: paginatedUsers.length,
        data: paginatedUsers
      });
    }

    return res.status(200).json({
      status: true,
      message: "IPACCT users fetched successfully",
      filterApplied: result.filterApplied,
      total: totalCount,
      data: users
    });
  } catch (error) {
    console.error("Error in listIpacctUsersController:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch user list from IPACCT"
    });
  }
};
