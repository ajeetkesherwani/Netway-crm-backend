const { callSoap } = require("../utils/soapApi");

async function addIpacctUser(userData) {
  try {
    console.log("Creating IPACCT user with data:", userData);
    
    // Construct the inner XML for the <user> object
    // Sending all fields exactly as IPACCT Postman collection expects, without CDATA
    const userXml = `
      <id>0</id>
      <name>${userData.name || ""}</name>
      <fee>0</fee>
      <ifee>0</ifee>
      <address>${userData.address || ""}</address>
      <phone>${userData.phone || ""}</phone>
      <mobile>${userData.mobile || ""}</mobile>
      <idid>${userData.username || ""}</idid>
      <enddateisnull>true</enddateisnull>
      <stopped>n</stopped>
      <pass>${userData.password || ""}</pass>
      <fuppackageid>0</fuppackageid>
      <tcpmax>0</tcpmax>
      <packagetype>c</packagetype>
      <packageid>${userData.packageId || 0}</packageid>
      <email>${userData.email || ""}</email>
      <ttl>0</ttl>
      <createdateisnull>true</createdateisnull>
      <zoneid>${userData.zoneid || 0}</zoneid>
      <havecontract>false</havecontract>
      <contractdateisnull>true</contractdateisnull>
    `;

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      id: "0",
      u: userXml
    };

    const response = await callSoap("ipbillAddUser", params);
    console.log("IPACCT add user response:", JSON.stringify(response, null, 2));

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    
    if (body && body["ns1:ipbillAddUserResponse"]) {
      return body["ns1:ipbillAddUserResponse"]?.result || body["ns1:ipbillAddUserResponse"];
    }
    
    return response;
  } catch (err) {
    console.error("Error creating IPACCT user:", err.message);
    return { error: err.message };
  }
}

module.exports = { addIpacctUser };
