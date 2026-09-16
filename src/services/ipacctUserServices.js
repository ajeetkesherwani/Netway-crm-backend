const { callSoap } = require("../utils/soapApi");

async function addIpacctUser(userData) {
  try {
    console.log("Creating IPACCT user with data:", userData);

    const now = new Date();
    const createDateStr = now.toISOString().split('T')[0];
    const lastWarnStr = createDateStr + "T00:00:00";
    
    // Calculate end date (1 month from now)
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const endDateStr = nextMonth.toISOString().split('T')[0];

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
      <enddate>${endDateStr}</enddate>
      <enddateisnull>false</enddateisnull>
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

async function syncIpacctUserExpiry(username, newExpiryDate) {
  try {
    console.log(`Syncing expiry date for IPACCT user ${username} to ${newExpiryDate}`);
    
    // Construct the keyvalue list for updating the enddate
    const rawParamsXML = `
      <id xsi:type="xsd:string">${username}</id>
      <keyvalue xsi:type="SOAP-ENC:Array" SOAP-ENC:arrayType="tns:keyvalue[1]">
          <item xsi:type="tns:keyvalue">
              <key xsi:type="xsd:string">enddate</key>
              <value xsi:type="xsd:string">${newExpiryDate}</value>
          </item>
      </keyvalue>
    `;

    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
    };

    const response = await callSoap("ipbillSetUserData", params, rawParamsXML);
    console.log("IPACCT set user data response:", JSON.stringify(response, null, 2));

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

module.exports = { addIpacctUser, syncIpacctUserExpiry };
