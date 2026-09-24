const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function testStaticIp(ip) {
  const username = "STATICUSER_" + Math.floor(1000 + Math.random() * 9000);
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="urn:IPACCTipbill" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/">
  <soap:Body>
    <ipbillAddUser xmlns="urn:IPACCTipbill">
      <user>pradeep</user>
      <pass>admin@2026</pass>
      <id>1</id>
      <u xsi:type="tns:user">
        <id>0</id>
        <name>Test User ${username}</name>
        <fee>100</fee>
        <ifee>18</ifee>
        <address>Noida</address>
        <pin>201301</pin>
        <phone>9999999999</phone>
        <mobile>9999999999</mobile>
        <pid></pid>
        <idid>${username}</idid>
        <enddate>2026-12-16</enddate>
        <enddateisnull>false</enddateisnull>
        <stopped>n</stopped>
        <pass>123456</pass>
        <fuppackageid>16</fuppackageid>
        <tcpmax>60</tcpmax>
        <packagetype>p</packagetype>
        <packageid>1</packageid>
        <packagename>Test Package</packagename>
        <comment>Created from CRM</comment>
        <email>${username}@example.com</email>
        <volumelimitat></volumelimitat>
        <volumenow></volumenow>
        <ttl>63</ttl>
        <createdate>2026-09-16</createdate>
        <createdateisnull>false</createdateisnull>
        <zoneid>1</zoneid>
        <zonename>TEST</zonename>
        <zoneadr>C-25</zoneadr>
        <zonepho></zonepho>
        <zonecomment></zonecomment>
        <zonepubname></zonepubname>
        <zonepubadr></zonepubadr>
        <zonepubpho></zonepubpho>
        <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
          <item xsi:type="tns:ip">
            <id xsi:type="xsd:integer">0</id>
            <login xsi:type="xsd:string">${username}</login>
            <ip xsi:type="xsd:string">${ip}</ip>
            <st_isweblogin xsi:type="xsd:boolean">false</st_isweblogin>
            <st_isonpppoe xsi:type="xsd:boolean">false</st_isonpppoe>
            <st_onlinemac xsi:type="xsd:string"></st_onlinemac>
            <st_onu xsi:type="xsd:string"></st_onu>
            <disabled xsi:type="xsd:boolean">false</disabled>
            <staticip xsi:type="xsd:string">${ip}</staticip>
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
                    <id xsi:type="xsd:integer">1</id>
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
        <contractdate>2026-09-16</contractdate>
        <contractdateisnull>true</contractdateisnull>
        <contractdata></contractdata>
        <lastwarn>2026-09-16T00:00:00</lastwarn>
        <billdata>
            <sendinvoice>true</sendinvoice>
            <sendsms>true</sendsms>
            <autorenew>true</autorenew>
            <onboardingid></onboardingid>
            <ekyc>false</ekyc>
            <ecaf>false</ecaf>
        </billdata>
      </u>
    </ipbillAddUser>
  </soap:Body>
</soap:Envelope>`;

  const options = {
    hostname: '139.5.198.58',
    port: 443,
    path: '/0/bgpost',
    method: 'POST',
    agent: agent,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "SOAPAction": '"urn:IPACCTipbill#ipbillAddUser"',
      "Content-Length": Buffer.byteLength(xml)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\nResult for static IP ${ip}:`);
        console.log(data);
        resolve();
      });
    });
    req.write(xml);
    req.end();
  });
}

const randomIp = `10.200.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
testStaticIp(randomIp);
