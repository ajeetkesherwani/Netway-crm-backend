require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");

async function testGetFreeIps() {
  const customOpts = {
    endpoint: "https://139.5.198.59:443/0/api",
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const rawParams = `
    <user xsi:type="xsd:string">admin</user>
    <pass xsi:type="xsd:string">sm@rtw@y</pass>
    <poolid xsi:type="xsd:integer">2</poolid>
    <count xsi:type="xsd:integer">5</count>
    <cmts xsi:type="xsd:boolean">false</cmts>
  `;

  console.log("Calling getPoolFreeIps for pool 2...");
  const res = await callSoap("getPoolFreeIps", {}, rawParams, customOpts);
  console.log("Free IPs response:", JSON.stringify(res, null, 2));
}

testGetFreeIps();
