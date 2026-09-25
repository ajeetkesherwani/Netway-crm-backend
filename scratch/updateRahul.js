require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");

async function updateRahul() {
  const customOpts59 = {
    endpoint: "https://139.5.198.59:443/0/api",
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const user = process.env.IPACCT_API_USER || "admin";
  const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

  // 1. Get free IP from Pool 2
  const rawParamsFree = `
    <user xsi:type="xsd:string">${user}</user>
    <pass xsi:type="xsd:string">${pass}</pass>
    <poolid xsi:type="xsd:integer">2</poolid>
    <count xsi:type="xsd:integer">1</count>
    <cmts xsi:type="xsd:boolean">false</cmts>
  `;
  const freeIpRes = await callSoap("getPoolFreeIps", {}, rawParamsFree, customOpts59);
  const items = freeIpRes?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.["ns1:getPoolFreeIpsResponse"]?.return?.item;
  const allocatedIp = items?._ || (Array.isArray(items) ? items[0]._ : items);
  console.log("Allocated free IP:", allocatedIp);

  // 2. Call setUser for user 68
  const userXml = `
    <id xsi:type="xsd:integer">68</id>
    <name xsi:type="xsd:string">rahul</name>
    <fee xsi:type="xsd:decimal">0</fee>
    <ifee xsi:type="xsd:decimal">18</ifee>
    <address xsi:type="xsd:string">noida</address>
    <pin xsi:type="xsd:string">875421</pin>
    <phone xsi:type="xsd:string">7383632575</phone>
    <mobile xsi:type="xsd:string">7383632575</mobile>
    <pid xsi:type="xsd:string"></pid>
    <idid xsi:type="xsd:string"></idid>
    <enddate xsi:type="xsd:date">2026-02-08</enddate>
    <enddateisnull xsi:type="xsd:boolean">false</enddateisnull>
    <futureenddate xsi:type="xsd:date">2026-02-08</futureenddate>
    <futureenddateisnull xsi:type="xsd:boolean">false</futureenddateisnull>
    <stopped xsi:type="tns:stopstatus">n</stopped>
    <pass xsi:type="xsd:string">123456</pass>
    <fuppackageid xsi:type="xsd:integer">16</fuppackageid>
    <tcpmax xsi:type="xsd:integer">60</tcpmax>
    <packagetype xsi:type="tns:packagetype">p</packagetype>
    <packageid xsi:type="xsd:integer">1</packageid>
    <packagename xsi:type="xsd:string">TEST 1000 Mbps</packagename>
    <comment xsi:type="xsd:string">Created from CRM</comment>
    <email xsi:type="xsd:string">rahul@gmail.com</email>
    <volumelimitat xsi:type="xsd:string">0</volumelimitat>
    <volumenow xsi:type="xsd:string">0</volumenow>
    <ttl xsi:type="xsd:integer">63</ttl>
    <createdate xsi:type="xsd:date">1900-01-01</createdate>
    <createdateisnull xsi:type="xsd:boolean">true</createdateisnull>
    <zoneid xsi:type="xsd:integer">3</zoneid>
    <zonename xsi:type="xsd:string">NOIDA</zonename>
    <zoneadr xsi:type="xsd:string"></zoneadr>
    <zonepho xsi:type="xsd:string"></zonepho>
    <zonecomment xsi:type="xsd:string"></zonecomment>
    <zonepubname xsi:type="xsd:string"></zonepubname>
    <zonepubadr xsi:type="xsd:string"></zonepubadr>
    <zonepubpho xsi:type="xsd:string"></zonepubpho>
    <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
      <item xsi:type="tns:ip">
        <id xsi:type="xsd:integer">0</id>
        <login xsi:type="xsd:string">rahul</login>
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
            <id xsi:type="xsd:integer">2</id>
            <name xsi:type="xsd:string">NOIDA-POOL</name>
          </item>
        </pools>
        <lat xsi:type="xsd:string"></lat>
        <lon xsi:type="xsd:string"></lon>
        <ip6 xsi:type="xsd:string"></ip6>
        <disabled6 xsi:type="xsd:boolean">false</disabled6>
      </item>
    </ips>
    <havecontract xsi:type="xsd:boolean">false</havecontract>
    <contractno xsi:type="xsd:string">0</contractno>
    <contractdate xsi:type="xsd:date">1900-01-01</contractdate>
    <contractdateisnull xsi:type="xsd:boolean">true</contractdateisnull>
    <contractdata xsi:type="xsd:string"></contractdata>
    <lastwarn xsi:type="xsd:dateTime">1900-01-01T00:00:00</lastwarn>
  `;

  const rawParams = `
    <user xsi:type="xsd:string">${user}</user>
    <pass xsi:type="xsd:string">${pass}</pass>
    <u xsi:type="tns:user">${userXml}</u>
  `;

  const res = await callSoap("setUser", {}, rawParams, customOpts59);
  console.log("setUser response:", JSON.stringify(res, null, 2));

  // Check updated user
  const getUserRes = await callSoap("getUser", { user, pass, id: 68 }, "", customOpts59);
  const updatedU = getUserRes?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.["ns1:getUserResponse"]?.return;
  console.log("UPDATED RAHUL POOL & IPS:", JSON.stringify(updatedU?.ips, null, 2));
}

updateRahul();
