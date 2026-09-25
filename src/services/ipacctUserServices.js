const { callSoap } = require("../utils/soapApi");

let poolsCache = null;
let poolsCacheTime = 0;

// Helper to dynamically fetch and resolve all pools from IPACCT
async function getIpacctPoolsList() {
  const now = Date.now();
  if (poolsCache && (now - poolsCacheTime < 5 * 60 * 1000)) {
    return poolsCache;
  }

  try {
    const customOpts = {
      endpoint: "https://139.5.198.59:443/0/api",
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };
    const user = process.env.IPACCT_API_USER || "admin";
    const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

    const response = await callSoap("getPools", { user, pass, zoneid: "" }, "", customOpts);
    const envelope = response?.["SOAP-ENV:Envelope"] || response?.["soapenv:Envelope"] || response;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.Body || response;
    const responseKey = Object.keys(body || {}).find(k => k.toLowerCase().includes("getpoolsresponse"));
    const responseData = responseKey ? body[responseKey] : body;
    const returnData = responseData?.return;

    let items = returnData?.item || [];
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    const list = items.map(p => ({
      id: p.id?._ !== undefined ? parseInt(p.id._, 10) : parseInt(p.id, 10) || 0,
      name: p.name?._ !== undefined ? p.name._ : (typeof p.name === "string" ? p.name : ""),
      zoneid: p.zoneid?._ !== undefined ? parseInt(p.zoneid._, 10) : parseInt(p.zoneid, 10) || 0
    }));

    if (list.length > 0) {
      poolsCache = list;
      poolsCacheTime = now;
      return list;
    }
  } catch (err) {
    console.error("Error fetching pools from IPACCT in getIpacctPoolsList:", err.message);
  }

  return poolsCache || [
    { id: 2, name: "NOIDA-POOL", zoneid: 3 },
    { id: 1, name: "TEST 100.64.40.1/24", zoneid: 1 }
  ];
}

// Dynamically resolve pool by ID, Name, or Zone ID
async function resolvePoolDynamic(poolInput, zoneIdInput) {
  const pools = await getIpacctPoolsList();
  const poolStr = (poolInput || "").toString().trim().toLowerCase();
  const zoneId = parseInt(zoneIdInput, 10) || 0;

  // 1. Try match by pool id (e.g. poolInput = "2" or 2)
  if (poolStr && !isNaN(poolStr)) {
    const idNum = parseInt(poolStr, 10);
    const matched = pools.find(p => p.id === idNum);
    if (matched) return matched;
  }

  // 2. Try match by pool name (e.g. poolInput = "NOIDA-POOL")
  if (poolStr) {
    const matched = pools.find(p => p.name.toLowerCase() === poolStr || p.name.toLowerCase().includes(poolStr));
    if (matched) return matched;
  }

  // 3. Try match by zone id (e.g. zoneId = 3 -> NOIDA-POOL, zoneId = 1 -> TEST)
  if (zoneId) {
    const matched = pools.find(p => p.zoneid === zoneId);
    if (matched) return matched;
  }

  if (poolStr && !isNaN(poolStr)) {
    return { id: parseInt(poolStr, 10), name: "", zoneid: zoneId };
  }

  return null;
}

// Dynamically get a free IP from an IPACCT pool
async function getFreeIpForPool(poolId) {
  try {
    const customOpts = {
      endpoint: "https://139.5.198.59:443/0/api",
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };
    const user = process.env.IPACCT_API_USER || "admin";
    const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

    const rawParams = `
      <user xsi:type="xsd:string">${user}</user>
      <pass xsi:type="xsd:string">${pass}</pass>
      <poolid xsi:type="xsd:integer">${poolId}</poolid>
      <count xsi:type="xsd:integer">1</count>
      <cmts xsi:type="xsd:boolean">false</cmts>
    `;
    const freeIpRes = await callSoap("getPoolFreeIps", {}, rawParams, customOpts);
    const envelope = freeIpRes?.["SOAP-ENV:Envelope"] || freeIpRes?.["soapenv:Envelope"] || freeIpRes;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.Body || freeIpRes;
    const responseKey = Object.keys(body || {}).find(k => k.toLowerCase().includes("getpoolfreeipsresponse"));
    const responseData = responseKey ? body[responseKey] : body;
    const returnData = responseData?.return;

    let items = returnData?.item;
    if (Array.isArray(items)) {
      items = items[0];
    }
    const ip = items?._ !== undefined ? items._ : (typeof items === "string" ? items : "");
    return ip;
  } catch (err) {
    console.error("Error fetching free IP from pool in getFreeIpForPool:", err.message);
    return "";
  }
}

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

    // Robustly extract PAN and Aadhaar from all possible aliases
    const panNumber = (
      userData.panNumber ||
      userData.panNo ||
      userData.pan ||
      userData.panCard ||
      userData.pancard ||
      userData.pid ||
      ""
    ).toString().trim();

    const adharNo = (
      userData.adharNo ||
      userData.aadharNo ||
      userData.aadhaarNo ||
      userData.aadharCard ||
      userData.idid ||
      ""
    ).toString().trim();

    console.log(`[IPACCT] Registering user with PAN (pid): "${panNumber}" and Aadhaar (idid): "${adharNo}"`);

    // Dynamically resolve pool ID and pool Name based on pool input or zone ID
    const poolInput = userData.poolId || userData.pool || userData.dynamicIpPool || "";
    const resolvedPool = await resolvePoolDynamic(poolInput, userData.zoneid);

    let activePoolId = 0;
    let activePoolName = "";
    if (resolvedPool) {
      activePoolId = resolvedPool.id;
      activePoolName = resolvedPool.name;
      console.log(`[IPACCT] Dynamically resolved pool: ID=${activePoolId}, Name="${activePoolName}" for zone=${userData.zoneid}`);
    } else if (poolInput) {
      activePoolId = !isNaN(poolInput) ? parseInt(poolInput, 10) : 0;
      activePoolName = isNaN(poolInput) ? poolInput : "";
    }

    // Determine IP address: if static IP provided, check if it belongs to chosen pool
    const isIpInPoolSubnet = (ip, poolId) => {
      if (!ip) return false;
      if (poolId === 2 && ip.startsWith("192.168.1.")) return true;
      if (poolId === 1 && ip.startsWith("100.64.40.")) return true;
      return false;
    };

    let assignedIp = (userData.ipAdress || userData.ipAddress || "").trim();
    let isStaticIp = false;

    if (activePoolId) {
      if (assignedIp && assignedIp !== "0.0.0.0" && isIpInPoolSubnet(assignedIp, activePoolId)) {
        isStaticIp = true;
        console.log(`[IPACCT] Using provided IP "${assignedIp}" within pool ${activePoolId} (${activePoolName})`);
      } else {
        const freeIp = await getFreeIpForPool(activePoolId);
        if (freeIp) {
          assignedIp = freeIp;
          isStaticIp = false;
          console.log(`[IPACCT] Allocated free IP "${assignedIp}" from pool ${activePoolId} (${activePoolName})`);
        }
      }
    } else if (assignedIp && assignedIp !== "0.0.0.0") {
      isStaticIp = true;
    }

    const hasIps = Boolean(assignedIp || activePoolId || userData.username);

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
      <pid>${panNumber}</pid>
      <idid>${adharNo}</idid>
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
      ${hasIps ? `
      <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
        <item xsi:type="tns:ip">
          <id xsi:type="xsd:integer">0</id>
          <login xsi:type="xsd:string">${userData.username || ""}</login>
          <ip xsi:type="xsd:string">${assignedIp}</ip>
          <st_isweblogin xsi:type="xsd:boolean">false</st_isweblogin>
          <st_isonpppoe xsi:type="xsd:boolean">false</st_isonpppoe>
          <st_onlinemac xsi:type="xsd:string"></st_onlinemac>
          <st_onu xsi:type="xsd:string"></st_onu>
          <disabled xsi:type="xsd:boolean">false</disabled>
          <staticip xsi:type="xsd:string">${isStaticIp ? assignedIp : ""}</staticip>
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
          <pools xsi:type="tns:idnamelist" SOAP-ENC:arrayType="tns:idname[${activePoolId ? 1 : 0}]">
              ${activePoolId ? `
              <item xsi:type="tns:idname">
                  <id xsi:type="xsd:integer">${activePoolId}</id>
                  <name xsi:type="xsd:string">${activePoolName}</name>
              </item>` : ''}
          </pools>
          <lat xsi:type="xsd:string"></lat>
          <lon xsi:type="xsd:string"></lon>
          <ip6 xsi:type="xsd:string"></ip6>
          <disabled6 xsi:type="xsd:boolean">false</disabled6>
        </item>
      </ips>` : `<ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[0]"></ips>`}
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

    const envelope = response["SOAP-ENV:Envelope"] || response["soapenv:Envelope"] || response;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.Body;

    if (body) {
      const addResp = body["ns1:ipbillAddUserResponse"] || body["ipbillAddUserResponse"] || body;
      addResp.allocatedIp = assignedIp;
      addResp.poolId = activePoolId;
      addResp.poolName = activePoolName;
      return addResp;
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

async function getIpacctUser(userIdOrIpacctId) {
  try {
    let targetIpacctId = String(userIdOrIpacctId).trim();

    // Check if user passed a Mongo ID or username from CRM to resolve their IPACCT ID
    const mongoose = require("mongoose");
    let crmUser = null;

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const User = require("../models/user");
      if (mongoose.Types.ObjectId.isValid(targetIpacctId)) {
        crmUser = await User.findById(targetIpacctId).lean();
      } else if (!/^\d+$/.test(targetIpacctId)) {
        // If not purely digits, check by username, UserId, or ipactId
        crmUser = await User.findOne({
          $or: [
            { "generalInformation.username": targetIpacctId },
            { "generalInformation.UserId": targetIpacctId },
            { "generalInformation.ipactId": targetIpacctId },
            { "generalInformation.ipacctCustomerId": targetIpacctId }
          ]
        }).lean();
      }

      if (crmUser) {
        if (crmUser.generalInformation?.ipactId) {
          targetIpacctId = String(crmUser.generalInformation.ipactId).trim();
        } else if (crmUser.generalInformation?.ipacctCustomerId) {
          targetIpacctId = String(crmUser.generalInformation.ipacctCustomerId).trim();
        }
      }
    }

    console.log(`[IPACCT] Calling ipbillGetUser with id: "${targetIpacctId}"`);

    const response = await callSoap("ipbillGetUser", {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      id: targetIpacctId
    });

    const envelope = response?.["SOAP-ENV:Envelope"] || response?.["soapenv:Envelope"] || response?.["soap:Envelope"] || response;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.["soap:Body"] || envelope?.Body || response;

    const responseKey = Object.keys(body || {}).find(key => key.toLowerCase().includes("ipbillgetuserresponse"));
    const responseData = responseKey ? body[responseKey] : body;

    const rawUser = responseData?.return || responseData?.user || null;

    // Check if user was not found on IPACCT (xsi:nil="true")
    if (
      !rawUser ||
      (rawUser.$ && rawUser.$["xsi:nil"] === "true") ||
      typeof rawUser !== "object" ||
      Object.keys(rawUser).length === 0
    ) {
      return {
        found: false,
        ipacctId: targetIpacctId,
        message: `No user found on IPACCT with ID: ${targetIpacctId}`
      };
    }

    // Helper to unwrap xml2js objects and clean attributes
    const cleanItem = (item) => {
      if (item === null || item === undefined) return "";
      if (typeof item !== "object") return item;
      if (item._ !== undefined) return item._;
      if (Array.isArray(item)) return item.map(cleanItem);
      const res = {};
      for (const [k, v] of Object.entries(item)) {
        if (k === "$" || k.startsWith("@_")) continue;
        res[k] = cleanItem(v);
      }
      return res;
    };

    const cleanedUser = cleanItem(rawUser);

    return {
      found: true,
      ipacctId: targetIpacctId,
      crmUser: crmUser
        ? {
          _id: crmUser._id,
          name: crmUser.generalInformation?.name,
          username: crmUser.generalInformation?.username,
          phone: crmUser.generalInformation?.phone,
          ipactId: crmUser.generalInformation?.ipactId
        }
        : null,
      userData: cleanedUser
    };
  } catch (err) {
    console.error("Error in getIpacctUser:", err.message);
    throw err;
  }
}

async function updateIpacctUserPan(ipacctIdOrCid, panNumber) {
  try {
    const pan = (panNumber || "").toString().trim();
    console.log(`[IPACCT] Updating PAN for user ${ipacctIdOrCid} to "${pan}"`);

    const customXml = `
      <id>${ipacctIdOrCid}</id>
      <keyvaluelist SOAP-ENC:arrayType="tns:keyvalue[1]">
        <item>
          <key>pid</key>
          <value>${pan}</value>
        </item>
      </keyvaluelist>
    `;

    const response = await callSoap(
      "ipbillSetUserData",
      {
        user: process.env.IPACCT_USER,
        pass: process.env.IPACCT_PASS
      },
      customXml
    );

    return response;
  } catch (err) {
    console.error("Error in updateIpacctUserPan:", err.message);
    throw err;
  }
}

async function listIpacctUsers(filters = {}) {
  try {
    const customOpts = {
      endpoint: "https://139.5.198.59:443/0/api",
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };

    const user = process.env.IPACCT_API_USER || "admin";
    const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

    // 1. Process filter options per IPACCT WSDL:
    // <xsd:complexType name="userfilter">
    //   <xsd:element name="zoneid" type="xsd:integer"/>
    //   <xsd:element name="packageid" type="xsd:integer"/>
    //   <xsd:element name="active" type="tns:activefilter"/>
    //   <xsd:element name="ppp" type="tns:activefilter"/>
    //   <xsd:element name="weblogin" type="tns:activefilter"/>
    //   <xsd:element name="stopped" type="tns:stopfilter"/>
    // </xsd:complexType>

    const zoneid = filters.zoneid !== undefined && filters.zoneid !== "" ? parseInt(filters.zoneid, 10) || 0 : 0;
    const packageid = filters.packageid !== undefined && filters.packageid !== "" ? parseInt(filters.packageid, 10) || 0 : 0;

    const validActive = ["yes", "no", "all"];
    const active = validActive.includes(String(filters.active || "").toLowerCase()) ? String(filters.active).toLowerCase() : "all";
    const ppp = validActive.includes(String(filters.ppp || "").toLowerCase()) ? String(filters.ppp).toLowerCase() : "all";
    const weblogin = validActive.includes(String(filters.weblogin || "").toLowerCase()) ? String(filters.weblogin).toLowerCase() : "all";

    const validStopped = ["stopped", "started", "auto", "autook", "autostop", "autoshaped", "warnperiod", "graceperiod", "havemsg", "all"];
    const stoppedInput = String(filters.stopped || "all").toLowerCase();
    const stopped = validStopped.includes(stoppedInput) ? stoppedInput : "all";

    const rawParamsXML = `
      <name xsi:type="xsd:string">${user}</name>
      <pass xsi:type="xsd:string">${pass}</pass>
      <uf xsi:type="tns:userfilter">
        <zoneid xsi:type="xsd:integer">${zoneid}</zoneid>
        <packageid xsi:type="xsd:integer">${packageid}</packageid>
        <active xsi:type="tns:activefilter">${active}</active>
        <ppp xsi:type="tns:activefilter">${ppp}</ppp>
        <weblogin xsi:type="tns:activefilter">${weblogin}</weblogin>
        <stopped xsi:type="tns:stopfilter">${stopped}</stopped>
      </uf>
    `;

    console.log(`[IPACCT] Calling listUsers on .59 server with filters:`, {
      zoneid,
      packageid,
      active,
      ppp,
      weblogin,
      stopped
    });

    const response = await callSoap("listUsers", {}, rawParamsXML, customOpts);

    const envelope = response?.["SOAP-ENV:Envelope"] || response?.["soapenv:Envelope"] || response;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.Body || response;
    const responseKey = Object.keys(body || {}).find(k => k.toLowerCase().includes("listusersresponse"));
    const responseData = responseKey ? body[responseKey] : body;
    const returnData = responseData?.return;

    let items = returnData?.item || [];
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    const cleanItem = (item) => {
      if (item === null || item === undefined) return "";
      if (typeof item !== "object") return item;
      if (item._ !== undefined) return item._;
      if (Array.isArray(item)) return item.map(cleanItem);
      const res = {};
      for (const [k, v] of Object.entries(item)) {
        if (k === "$" || k.startsWith("@_")) continue;
        res[k] = cleanItem(v);
      }
      if (Object.keys(res).length === 0) return "";
      return res;
    };

    let cleanedUsers = items.map(cleanItem);

    // Optional convenience post-filtering (search by name, username, mobile, phone, ip)
    if (filters.search || filters.name || filters.username || filters.mobile || filters.phone || filters.ip) {
      const search = String(filters.search || filters.name || filters.username || "").toLowerCase().trim();
      const mobile = String(filters.mobile || filters.phone || "").trim();
      const ip = String(filters.ip || "").trim();

      cleanedUsers = cleanedUsers.filter(u => {
        let match = true;
        if (search) {
          const uName = String(u.name || "").toLowerCase();
          const ipsItem = u.ips?.item;
          let uLogin = "";
          if (Array.isArray(ipsItem)) {
            uLogin = ipsItem.map(i => i?.login || "").join(" ").toLowerCase();
          } else if (ipsItem) {
            uLogin = String(ipsItem.login || "").toLowerCase();
          }
          match = match && (uName.includes(search) || uLogin.includes(search));
        }
        if (mobile) {
          const uMobile = String(u.mobile || "");
          const uPhone = String(u.phone || "");
          match = match && (uMobile.includes(mobile) || uPhone.includes(mobile));
        }
        if (ip) {
          const ipsItem = u.ips?.item;
          let allIps = [];
          if (Array.isArray(ipsItem)) {
            allIps = ipsItem.map(i => `${i?.ip || ""} ${i?.staticip || ""}`);
          } else if (ipsItem) {
            allIps = [`${ipsItem.ip || ""} ${ipsItem.staticip || ""}`];
          }
          match = match && allIps.some(ipStr => ipStr.includes(ip));
        }
        return match;
      });
    }

    return {
      success: true,
      filterApplied: {
        zoneid,
        packageid,
        active,
        ppp,
        weblogin,
        stopped,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.name ? { name: filters.name } : {}),
        ...(filters.username ? { username: filters.username } : {}),
        ...(filters.mobile ? { mobile: filters.mobile } : {}),
        ...(filters.ip ? { ip: filters.ip } : {})
      },
      total: cleanedUsers.length,
      users: cleanedUsers
    };
  } catch (err) {
    console.error("Error in listIpacctUsers service:", err.message);
    throw err;
  }
}

module.exports = {
  addIpacctUser,
  syncIpacctUserExpiry,
  getIpacctUser,
  updateIpacctUserPan,
  listIpacctUsers,
  resolvePoolDynamic,
  getIpacctPoolsList,
  getFreeIpForPool
};

