require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");

async function testFilter(zoneid = 0, packageid = 0, active = "all", stopped = "all") {
  const customOpts = {
    endpoint: "https://139.5.198.59:443/0/api",
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const user = process.env.IPACCT_API_USER || "admin";
  const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

  const rawParamsXML = `
    <name xsi:type="xsd:string">${user}</name>
    <pass xsi:type="xsd:string">${pass}</pass>
    <uf xsi:type="tns:userfilter">
      <zoneid xsi:type="xsd:integer">${zoneid}</zoneid>
      <packageid xsi:type="xsd:integer">${packageid}</packageid>
      <active xsi:type="tns:activefilter">${active}</active>
      <ppp xsi:type="tns:activefilter">all</ppp>
      <weblogin xsi:type="tns:activefilter">all</weblogin>
      <stopped xsi:type="tns:stopfilter">${stopped}</stopped>
    </uf>
  `;

  try {
    const res = await callSoap("listUsers", {}, rawParamsXML, customOpts);
    const envelope = res?.["SOAP-ENV:Envelope"] || res?.["soapenv:Envelope"] || res;
    const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"] || envelope?.Body || res;
    const responseKey = Object.keys(body || {}).find(k => k.toLowerCase().includes("listusersresponse"));
    const responseData = responseKey ? body[responseKey] : body;
    const returnData = responseData?.return;

    let items = returnData?.item || [];
    if (!Array.isArray(items)) {
      items = items ? [items] : [];
    }

    console.log(`Filter [zoneid=${zoneid}, packageid=${packageid}, active=${active}, stopped=${stopped}] returned ${items.length} users.`);
  } catch (err) {
    console.error("Filter error:", err.message);
  }
}

async function run() {
  await testFilter(0, 0, "all", "all");
  await testFilter(1, 0, "all", "all");
  await testFilter(9999, 0, "all", "all");
  await testFilter(0, 0, "yes", "all");
}

run();
