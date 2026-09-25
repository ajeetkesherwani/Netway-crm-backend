require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");
const { listIpacctUsers } = require("../src/services/ipacctUserServices");

async function testWithIpsEntry() {
  const username = "testpooluser_" + Math.floor(Math.random() * 10000);
  const poolId = 2;
  const poolName = "NOIDA-POOL";

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
        <ip xsi:type="xsd:string"></ip>
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

  const params = {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS,
    id: "1"
  };

  const rawParamsXML = `<u xsi:type="tns:user">${userXml}</u>`;

  const res = await callSoap("ipbillAddUser", params, rawParamsXML);
  console.log("Add response:", JSON.stringify(res, null, 2));

  const listRes = await listIpacctUsers({ search: username });
  console.log("Result for user:", JSON.stringify(listRes.users[0]?.ips, null, 2));
}

testWithIpsEntry();
