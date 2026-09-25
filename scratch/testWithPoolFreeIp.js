require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");
const { listIpacctUsers } = require("../src/services/ipacctUserServices");

async function testWithPoolFreeIp() {
  const customOpts59 = {
    endpoint: "https://139.5.198.59:443/0/api",
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const poolId = 2;
  const poolName = "NOIDA-POOL";

  // 1. Get free IP from pool
  const rawParams = `
    <user xsi:type="xsd:string">admin</user>
    <pass xsi:type="xsd:string">sm@rtw@y</pass>
    <poolid xsi:type="xsd:integer">${poolId}</poolid>
    <count xsi:type="xsd:integer">1</count>
    <cmts xsi:type="xsd:boolean">false</cmts>
  `;
  const freeIpRes = await callSoap("getPoolFreeIps", {}, rawParams, customOpts59);
  const items = freeIpRes?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.["ns1:getPoolFreeIpsResponse"]?.return?.item;
  const allocatedIp = items?._ || (Array.isArray(items) ? items[0]._ : items);
  console.log("Allocated free IP from pool:", allocatedIp);

  // 2. Create user with this allocated IP and pool
  const username = "testpooluser_" + Math.floor(Math.random() * 10000);
  const userXml = `
    <id>0</id>
    <name>${username}</name>
    <fee>0</fee>
    <ifee>18</ifee>
    <address>Noida test</address>
    <pin>201001</pin>
    <phone>9999988888</phone>
    <mobile>9999988888</mobile>
    <pid></pid>
    <idid></idid>
    <enddate xsi:type="xsd:date">2027-10-26</enddate>
    <enddateisnull xsi:type="xsd:boolean">false</enddateisnull>
    <stopped>n</stopped>
    <pass>123456</pass>
    <fuppackageid>16</fuppackageid>
    <tcpmax>60</tcpmax>
    <packagetype>p</packagetype>
    <packageid>1</packageid>
    <packagename>TEST 1000 Mbps</packagename>
    <comment>Created from CRM</comment>
    <email>pool@test.com</email>
    <volumelimitat></volumelimitat>
    <volumenow></volumenow>
    <ttl>63</ttl>
    <createdate>2026-09-25</createdate>
    <createdateisnull>false</createdateisnull>
    <zoneid>3</zoneid>
    <zonename>NOIDA</zonename>
    <zoneadr></zoneadr>
    <zonepho></zonepho>
    <zonecomment></zonecomment>
    <zonepubname></zonepubname>
    <zonepubadr></zonepubadr>
    <zonepubpho></zonepubpho>
    <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
      <item xsi:type="tns:ip">
        <id xsi:type="xsd:integer">0</id>
        <login xsi:type="xsd:string">${username}</login>
        <ip xsi:type="xsd:string">${allocatedIp}</ip>
        <st_isweblogin xsi:type="xsd:boolean">false</st_isweblogin>
        <st_isonpppoe xsi:type="xsd:boolean">false</st_isonpppoe>
        <st_onlinemac xsi:type="xsd:string"></st_onlinemac>
        <st_onu xsi:type="xsd:string"></st_onu>
        <disabled xsi:type="xsd:boolean">false</disabled>
        <staticip xsi:type="xsd:string"></staticip>
        <stopped xsi:type="xsd:boolean">false</stopped>
        <pass xsi:type="xsd:string">123456</pass>
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
        <macs xsi:type="tns:strlist" SOAP-ENC:arrayType="xsd:string[0]"></macs>
        <pools xsi:type="tns:idnamelist" SOAP-ENC:arrayType="tns:idname[1]">
          <item xsi:type="tns:idname">
            <id xsi:type="xsd:integer">${poolId}</id>
            <name xsi:type="xsd:string">${poolName}</name>
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
  `;

  const res = await callSoap("ipbillAddUser", {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS,
    id: "1"
  }, `<u xsi:type="tns:user">${userXml}</u>`);

  console.log("Add response:", JSON.stringify(res?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"], null, 2));

  // Check saved user in IPACCT
  const list = await listIpacctUsers({ search: username });
  console.log("SAVED USER ON IPACCT:", JSON.stringify(list.users[0]?.ips, null, 2));
}

testWithPoolFreeIp();
