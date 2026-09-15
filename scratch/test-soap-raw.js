const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ipbillAddUser>
      <user>vibashcrm</user>
      <pass>5tr0ngP60pl3</pass>
      <id>0</id>
      <u>
        <id>0</id>
        <name>John Doe</name>
        <fee>0</fee>
        <ifee>0</ifee>
        <address>123 St</address>
        <phone>123456</phone>
        <mobile>123456</mobile>
        <pid></pid>
        <idid>johndoe</idid>
        <enddate></enddate>
        <enddateisnull>true</enddateisnull>
        <stopped></stopped>
        <pass>pass123</pass>
        <fuppackageid>0</fuppackageid>
        <tcpmax>0</tcpmax>
        <packagetype></packagetype>
        <packageid>254</packageid>
        <packagename></packagename>
        <comment></comment>
        <email>john@example.com</email>
        <volumelimitat></volumelimitat>
        <volumenow></volumenow>
        <ttl>0</ttl>
        <createdate></createdate>
        <createdateisnull>true</createdateisnull>
        <zoneid>29</zoneid>
        <zonename></zonename>
        <zoneadr></zoneadr>
        <zonepho></zonepho>
        <zonecomment></zonecomment>
        <zonepubname></zonepubname>
        <zonepubadr></zonepubadr>
        <zonepubpho></zonepubpho>
        <ips></ips>
        <havecontract>false</havecontract>
        <contractno></contractno>
        <contractdate></contractdate>
        <contractdateisnull>true</contractdateisnull>
        <contractdata></contractdata>
        <lastwarn></lastwarn>
      </u>
    </ipbillAddUser>
  </soap:Body>
</soap:Envelope>`;

axios.post('https://103.255.232.146:443/0/bgpost', xml, {
  httpsAgent: agent,
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "SOAPAction": "urn:IPACCTipbill#ipbillAddUser"
  }
}).then(res => {
  console.log("Raw response:", res.data);
}).catch(err => {
  console.log("Error:", err.message);
});
