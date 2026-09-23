const { callSoap } = require("../../../utils/soapApi");
const AppError = require("../../../utils/AppError");

exports.getPoolsFromIpacct = async (req, res, next) => {
  try {
    const { zoneid, ipacctid } = req.body;

    if (zoneid === undefined || zoneid === null) {
      return next(new AppError("Please provide a zoneid", 400));
    }

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      ipacctid: ipacctid !== undefined ? ipacctid.toString() : "1",
      zoneid: zoneid.toString(),
    };

    const customOpts = {
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };

    console.log(`Fetching pools for zoneid ${zoneid} from IPACCT...`);
    const response = await callSoap("ipbillGetPools", params, "", customOpts);

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    const returnData = body?.["ns1:ipbillGetPoolsResponse"]?.return;

    let poolsList = [];
    if (returnData && returnData.item) {
      const items = Array.isArray(returnData.item) ? returnData.item : [returnData.item];
      poolsList = items.map((pool) => {
        return {
          id: typeof pool.id === "object" ? pool.id._ : pool.id,
          name: typeof pool.name === "object" ? pool.name._ : pool.name,
          zoneid: typeof pool.zoneid === "object" ? pool.zoneid._ : pool.zoneid,
        };
      });
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
