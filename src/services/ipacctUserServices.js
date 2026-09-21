const { callSoap } = require("../utils/soapApi");

async function addIpacctUser(userData) {
  try {
    console.log("Creating IPACCT user with data:", userData);

    const now = new Date();
    const createDateStr = now.toISOString().split('T')[0];
    const lastWarnStr = createDateStr + "T00:00:00";

    // Calculate end date based on package expiry or default to today
    let endDateStr = createDateStr;
    if (userData.expiryDate) {
      try {
        const parsedExp = new Date(userData.expiryDate);
        if (!isNaN(parsedExp.getTime())) {
          endDateStr = parsedExp.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Invalid expiryDate format provided to IPACCT:", userData.expiryDate);
      }
    }

    // Construct the inner XML for the <user> object exactly matching the WSDL <xsd:complexType name="user">
    const userXml = `
      <id>0</id>
      <name>${userData.name || ""}</name>
      <fee>${userData.fee || "0"}</fee>
      <ifee>18</ifee>
      <address>${userData.address || ""}</address>
      <pin>${userData.pin || ""}</pin>
      <phone>${userData.phone || ""}</phone>
      <mobile>${userData.mobile || ""}</mobile>
      <pid></pid>
      <idid>${userData.username || ""}</idid>
      <enddate xsi:type="xsd:date">${endDateStr}</enddate>
      <enddateisnull xsi:type="xsd:boolean">false</enddateisnull>
      <stopped>n</stopped>
      <pass>${userData.password || ""}</pass>
      <fuppackageid>16</fuppackageid>
      <tcpmax>60</tcpmax>
      <packagetype>p</packagetype>
      <packageid>${userData.packageId || 0}</packageid>
      <packagename>${userData.packageName || "Test Package"}</packagename>
      <comment>Created from CRM</comment>
      <email>${userData.email || ""}</email>
      <volumelimitat></volumelimitat>
      <volumenow></volumenow>
      <ttl>63</ttl>
      <createdate>${createDateStr}</createdate>
      <createdateisnull>false</createdateisnull>
      <zoneid>${userData.zoneid || 0}</zoneid>
      <zonename>${userData.zonename || "TEST"}</zonename>
      <zoneadr></zoneadr>
      <zonepho></zonepho>
      <zonecomment></zonecomment>
      <zonepubname></zonepubname>
      <zonepubadr></zonepubadr>
      <zonepubpho></zonepubpho>
      <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[0]"></ips>
      <havecontract>false</havecontract>
      <contractno></contractno>
      <contractdate></contractdate>
      <contractdateisnull>true</contractdateisnull>
      <contractdata></contractdata>
      <lastwarn></lastwarn>
      <billdata>
          <sendinvoice>true</sendinvoice>
          <sendsms>true</sendsms>
          <autorenew>true</autorenew>
          <onboardingid></onboardingid>
          <ekyc>false</ekyc>
          <ecaf>false</ecaf>
      </billdata>
    `;

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      id: "1"
    };

    const rawParamsXML = `<u xsi:type="tns:user">${userXml}</u>`;

    const response = await callSoap("ipbillAddUser", params, rawParamsXML);
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

/*
// OLD FUNCTION - Hits .58 /0/bgpost and fails with sql error
async function syncIpacctUserExpiry(username, newExpiryDate) {
  try {
    console.log(`Syncing expiry date for IPACCT user ${username} to ${newExpiryDate}`);

    const rawParamsXML = `
      <id>${username}</id>
      <keyvalue>
          <item>
              <key>enddate</key>
              <value>${newExpiryDate}</value>
          </item>
      </keyvalue>
    `;

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
    };

    const response = await callSoap("ipbillSetUserData", params, rawParamsXML);
    console.log("IPACCT set user expiry response:", JSON.stringify(response, null, 2));

    if (!response || typeof response === 'string') {
      return { error: `Invalid response from IPACCT endpoint: ${response || 'empty'}` };
    }

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    
    if (body && body["ns1:ipbillSetUserDataResponse"]) {
      return body["ns1:ipbillSetUserDataResponse"]?.return || body["ns1:ipbillSetUserDataResponse"];
    }
    
    return response;
  } catch (err) {
    console.error("Error syncing IPACCT user expiry:", err.message);
    return { error: err.message };
  }
}
*/

// NEW FUNCTION - Hits .59 /0/api endpoint with the correct credentials
async function syncIpacctUserExpiry(ipacctId, newExpiryDate) {
  try {
    console.log(`Syncing expiry date for IPACCT user ID ${ipacctId} to ${newExpiryDate} using .59 API`);
    
    // Vendor specified API: setClientExpDate on /0/api endpoint
    const params = {
      user: process.env.IPACCT_API_USER, // Need new credential for .59
      pass: process.env.IPACCT_API_PASS, // Need new credential for .59
      cid: ipacctId, // We are correctly passing the numeric IPACCT ID here!
      expdate: newExpiryDate,
      expdateisnull: "false"
    };

    const customOpts = {
      endpoint: "https://139.5.198.59:443/0/api", // The API server
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };

    console.log("---- IPACCT EXPIRY SYNC PAYLOAD (.59 SERVER) ----");
    console.log("Endpoint:", customOpts.endpoint);
    console.log("Method:", "setClientExpDate");
    console.log("Params:", JSON.stringify(params, null, 2));
    console.log("--------------------------------------------------");

    const response = await callSoap("setClientExpDate", params, "", customOpts);
    
    console.log("---- IPACCT EXPIRY SYNC RESPONSE ----");
    console.log(JSON.stringify(response, null, 2));
    console.log("-------------------------------------");

    if (!response || typeof response === 'string') {
      return { error: `Invalid response from IPACCT endpoint: ${response || 'empty'}` };
    }

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"];
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
    
    if (body && body["ns1:setClientExpDateResponse"]) {
      return body["ns1:setClientExpDateResponse"]?.return || body["ns1:setClientExpDateResponse"];
    }
    
    return response;
  } catch (err) {
    console.error("Error syncing IPACCT user expiry:", err.message);
    return { error: err.message };
  }
}

module.exports = { addIpacctUser, syncIpacctUserExpiry };
