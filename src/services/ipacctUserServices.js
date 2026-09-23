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
      <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
        <item xsi:type="tns:ip">
          <id xsi:type="xsd:integer">0</id>
          <login xsi:type="xsd:string">${userData.username || ""}</login>
          <ip xsi:type="xsd:string">${userData.ipAdress || "192.168.1.100"}</ip>
          <st_isweblogin xsi:type="xsd:boolean">false</st_isweblogin>
          <st_isonpppoe xsi:type="xsd:boolean">false</st_isonpppoe>
          <st_onlinemac xsi:type="xsd:string"></st_onlinemac>
          <st_onu xsi:type="xsd:string"></st_onu>
          <disabled xsi:type="xsd:boolean">false</disabled>
          <staticip xsi:type="xsd:string">${userData.ipAdress || "192.168.1.100"}</staticip>
          <stopped xsi:type="xsd:boolean">false</stopped>
          <pass xsi:type="xsd:string">${userData.password || ""}</pass>
          <protection xsi:type="tns:protection">none</protection>
          <graphip xsi:type="xsd:boolean">false</graphip>
          <interface xsi:type="xsd:string"></interface>
          <cmtsip xsi:type="xsd:string"></cmtsip>
          <cmtscfgid xsi:type="xsd:integer">0</cmtscfgid>
          <cmtsmodemmac xsi:type="xsd:string"></cmtsmodemmac>
          <cmtsremote xsi:type="xsd:boolean">false</cmtsremote>
          <radiusremote xsi:type="xsd:boolean">false</radiusremote>
          <monitor xsi:type="xsd:boolean">false</monitor>
          <disabledhcp xsi:type="xsd:boolean">false</disabledhcp>
          <autosaveif xsi:type="xsd:boolean">false</autosaveif>
          <autosavemac xsi:type="xsd:boolean">false</autosavemac>
          <hostname xsi:type="xsd:string"></hostname>
          <filename xsi:type="xsd:string"></filename>
          <macs xsi:type="tns:strlist" SOAP-ENC:arrayType="xsd:string[${userData.macId ? 1 : 0}]">
            ${userData.macId ? `<item xsi:type="xsd:string">${userData.macId}</item>` : ''}
          </macs>
          <pools xsi:type="tns:idnamelist" SOAP-ENC:arrayType="tns:idname[1]">
              <item xsi:type="tns:idname">
                  <id xsi:type="xsd:integer">${userData.poolId || 1}</id>
                  <name xsi:type="xsd:string"></name>
              </item>
          </pools>
          <lat xsi:type="xsd:string"></lat>
          <lon xsi:type="xsd:string"></lon>
          <ip6 xsi:type="xsd:string"></ip6>
          <disabled6 xsi:type="xsd:boolean">false</disabled6>
        </item>
      </ips>
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
    const customOpts = {
      endpoint: "https://139.5.198.59:443/0/api", // The API server
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };

    const user = process.env.IPACCT_API_USER || "admin";
    const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

    // Build the EXACT XML requested by user with xsi:type attributes
    const rawParamsXML = `
      <user xsi:type="xsd:string">${user}</user>
      <pass xsi:type="xsd:string">${pass}</pass>
      <cid xsi:type="xsd:integer">${ipacctId}</cid>
      <expdate xsi:type="xsd:date">${newExpiryDate}</expdate>
      <expdateisnull xsi:type="xsd:boolean">false</expdateisnull>
    `;

    console.log("---- IPACCT EXPIRY SYNC PAYLOAD (.59 SERVER) ----");
    console.log("Endpoint:", customOpts.endpoint);
    console.log("Method:", "setClientExpDate");
    console.log("Raw Params XML:", rawParamsXML);
    console.log("--------------------------------------------------");

    // Pass empty params object, and pass rawParamsXML as the string
    const response = await callSoap("setClientExpDate", {}, rawParamsXML, customOpts);
    
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
