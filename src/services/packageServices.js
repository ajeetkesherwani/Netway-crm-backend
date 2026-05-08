const Package = require("../models/package");
const { callSoap } = require("../utils/soapApi");
const { cleanResponse } = require("../utils/cleanSoapResponse");

// GET SOAP PACKAGES
async function getAllPackages() {
  const response = await callSoap("ipbillGetAllPackages", {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS
  });

  const envelope =
    response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];

  const body =
    envelope["SOAP-ENV:Body"] || envelope["soapenv:Body"];

  const responseKey = Object.keys(body).find(key =>
    key.includes("ipbillGetAllPackagesResponse")
  );

  const responseData = body[responseKey];

  let packages =
    responseData?.return?.item ||
    responseData?.item ||
    [];

  if (!Array.isArray(packages)) {
    packages = [packages];
  }

  packages = packages.map(cleanResponse);

  return packages;
}

async function syncAndUpdatePackages() {
  const soapPackages = await getAllPackages(); // 🔹 get SOAP data

  const dbPackages = await Package.find();

  // 🔹 update silently
  for (let dbPkg of dbPackages) {
    const match = soapPackages.find(
      sp =>
        sp.name.trim().toLowerCase().includes(
          dbPkg.name.trim().toLowerCase()
        )
    );

    if (match) {
      dbPkg.IppactId = match.id;
      await dbPkg.save();
    }
  }

  return soapPackages;
}

module.exports = { getAllPackages, syncAndUpdatePackages };