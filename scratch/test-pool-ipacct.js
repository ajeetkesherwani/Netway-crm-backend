const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const testPayload = (bodyXml) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="urn:IPACCTipbill" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/">
  <soap:Body>
    <ipbillAddUser xmlns="urn:IPACCTipbill">
      <user>pradeep</user>
      <pass>admin@2026</pass>
      <id>1</id>
      <u xsi:type="tns:user">
        <id>0</id>
        <name>Test Pool User</name>
        <fee>100</fee>
        <ifee>18</ifee>
        <address>Noida</address>
        <pin>201301</pin>
        <phone>9999999999</phone>
        <mobile>9999999999</mobile>
        <pid>MYPAN123</pid>
        <idid>MYAADHAAR456</idid>
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
        <email>test@example.com</email>
        <volumelimitat></volumelimitat>
        <volumenow></volumenow>
        <ttl>63</ttl>
        <createdate>2026-09-16</createdate>
        <createdateisnull>false</createdateisnull>
        <zoneid>1</zoneid>
        <zonename>TEST</zonename>
        <zoneadr></zoneadr>
        <zonepho></zonepho>
        <zonecomment></zonecomment>
        <zonepubname></zonepubname>
        <zonepubadr></zonepubadr>
        <zonepubpho></zonepubpho>
        ${bodyXml}
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

function call(xml) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: '139.5.198.58',
      port: 443,
      path: '/0/bgpost',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'urn:IPACCTipbill#ipbillAddUser',
        'Content-Length': Buffer.byteLength(xml)
      },
      agent
    }, res => {
      let data = '';
      console.log('Status:', res.statusCode);
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    });
    req.on('error', e => {
      console.error('Request error:', e.message);
      resolve(e.message);
    });
    req.write(xml);
    req.end();
  });
}

(async () => {
  // Test 1: Empty ips (dynamic pppoe user)
  const res1 = await call(testPayload('<ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[0]"></ips>'));
  console.log('Result 1 (Empty IPS):', res1);

  // Test 2: ips with pool, but empty ip/staticip
  const res2 = await call(testPayload(`
    <ips xsi:type="tns:ips" SOAP-ENC:arrayType="tns:ip[1]">
      <item xsi:type="tns:ip">
        <id xsi:type="xsd:integer">0</id>
        <login xsi:type="xsd:string">TESTLOGIN${Math.floor(1000 + Math.random()*9000)}</login>
        <ip xsi:type="xsd:string">192.168.10.102</ip>
        <st_isweblogin xsi:type="xsd:boolean">false</st_isweblogin>
        <st_isonpppoe xsi:type="xsd:boolean">false</st_isonpppoe>
        <st_onlinemac xsi:type="xsd:string"></st_onlinemac>
        <st_onu xsi:type="xsd:string"></st_onu>
        <disabled xsi:type="xsd:boolean">false</disabled>
        <staticip xsi:type="xsd:string">192.168.10.102</staticip>
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
                <id xsi:type="xsd:integer">0</id>
                <name xsi:type="xsd:string">NOIDA-POOL</name>
            </item>
        </pools>
        <lat xsi:type="xsd:string"></lat>
        <lon xsi:type="xsd:string"></lon>
        <ip6 xsi:type="xsd:string"></ip6>
        <disabled6 xsi:type="xsd:boolean">false</disabled6>
      </item>
    </ips>
  `));
  console.log('Result 2 (Pool with empty IP):', res2);
})();
