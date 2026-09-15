const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config();

async function getValidData() {
  try {
    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS
    };

    console.log("Fetching Zones...");
    const zonesRes = await callSoap("ipbillGetZones", params);
    if (zonesRes && zonesRes["SOAP-ENV:Envelope"]) {
      const body = zonesRes["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
      const returnData = body["ns1:ipbillGetZonesResponse"]["return"];
      console.log("Zones:", JSON.stringify(returnData, null, 2));
    }

    console.log("\nFetching Packages...");
    const pkgsRes = await callSoap("ipbillGetAllPackages", params);
    if (pkgsRes && pkgsRes["SOAP-ENV:Envelope"]) {
      const body = pkgsRes["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
      const returnData = body["ns1:ipbillGetAllPackagesResponse"]["return"];
      console.log("Packages:", JSON.stringify(returnData, null, 2));
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

getValidData();
