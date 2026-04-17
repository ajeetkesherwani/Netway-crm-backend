// services/packageService.js
const { callSoap } = require("../utils/soapApi");
const {  cleanResponse }  = require("../utils/cleanSoapResponse");

async function getAllPackages() {
 const response = await callSoap("ipbillGetAllPackages", {
  user: process.env.IPACCT_USER,
  pass: process.env.IPACCT_PASS
});

//   console.log("USER:", process.env.IPPACT_USER);
// console.log("PASS:", process.env.IPPACT_PASS);

  const envelope =
    response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];

  const body =
    envelope["SOAP-ENV:Body"] || envelope["soapenv:Body"];

  // console.log("BODY:", JSON.stringify(body, null, 2));

  // dynamic key
  const responseKey = Object.keys(body).find(key =>
    key.includes("ipbillGetAllPackagesResponse")
  );

  const responseData = body[responseKey];

  // 🔥 HANDLE BOTH CASES
  let packages =
    responseData?.return?.item ||   // normal case
    responseData?.item ||           // fallback
    [];

  // ensure array
  if (!Array.isArray(packages)) {
    packages = [packages];
  }


  // CLEAN FUNCTION HERE
  packages = packages.map(cleanResponse);

  console.log("PACKAGES:", packages.length);

  return packages;
}
module.exports = { getAllPackages };