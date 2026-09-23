const { callSoap } = require("../../../utils/soapApi");
const AppError = require("../../../utils/AppError");

exports.getPoolsFromIpacct = async (req, res, next) => {
  try {
    const { zoneid } = req.body;

    if (zoneid === undefined || zoneid === null) {
      return next(new AppError("Please provide a zoneid", 400));
    }

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      ipacctid: "0",
      zoneid: zoneid.toString(),
    };

    console.log(`Fetching pools for zoneid ${zoneid} from IPACCT...`);
    const response = await callSoap("ipbillGetPools", params);

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    const returnData = body?.["ns1:ipbillGetPoolsResponse"]?.return;

    let poolsList = [];
    if (returnData && returnData.item) {
      poolsList = returnData.item;
      if (!Array.isArray(poolsList)) {
        poolsList = [poolsList];
      }
    }

    res.status(200).json({
      status: "success",
      message: `Successfully fetched pools from IPACCT for zoneid ${zoneid}`,
      data: poolsList,
    });
  } catch (error) {
    console.error("Error fetching pools from IPACCT:", error.message);
    next(new AppError("Failed to fetch pools from IPACCT: " + error.message, 500));
  }
};
