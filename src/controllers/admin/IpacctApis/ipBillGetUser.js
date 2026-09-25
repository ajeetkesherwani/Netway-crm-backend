const { getIpacctUser } = require("../../../services/ipacctUserServices");
const AppError = require("../../../utils/AppError");

/**
 * Controller to fetch single user details directly from IPACCT via SOAP (ipbillGetUser).
 * Accepts:
 *   - body.id / body.ipacctId (e.g. { "id": "7" })
 *   - query.id (e.g. ?id=7)
 *   - params.id (e.g. /get-user/7)
 * Also supports CRM Mongo ObjectId or CRM username, automatically resolving their IPACCT ID.
 */
exports.getIpacctUserDetails = async (req, res, next) => {
  try {
    const id =
      req.body?.id ||
      req.body?.ipacctId ||
      req.query?.id ||
      req.params?.id ||
      req.body?.username ||
      req.query?.username;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Please provide an 'id' (or 'ipacctId') in request body, params, or query. Example: { \"id\": \"7\" }"
      });
    }

    const result = await getIpacctUser(id);

    return res.status(200).json({
      status: true,
      message: result.found
        ? "IPACCT user data fetched successfully"
        : result.message,
      data: result
    });
  } catch (error) {
    console.error("Error in getIpacctUserDetails controller:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Failed to fetch user from IPACCT"
    });
  }
};
