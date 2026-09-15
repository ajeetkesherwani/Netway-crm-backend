const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ 
  rejectUnauthorized: false,
  keepAlive: false
});

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
        <idid>johndoe</idid>
        <enddateisnull>true</enddateisnull>
        <stopped>n</stopped>
        <pass>pass123</pass>
        <fuppackageid>0</fuppackageid>
        <tcpmax>0</tcpmax>
        <packagetype>c</packagetype>
        <packageid>254</packageid>
        <email>john@example.com</email>
        <ttl>0</ttl>
        <createdateisnull>true</createdateisnull>
        <zoneid>29</zoneid>
        <havecontract>false</havecontract>
        <contractdateisnull>true</contractdateisnull>
      </u>
    </ipbillAddUser>
  </soap:Body>
</soap:Envelope>`;

axios.post('https://103.255.232.146:443/0/bgpost', xml, {
  httpsAgent: agent,
  headers: {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": Buffer.byteLength(xml, "utf8"),
    "Connection": "close",
    "SOAPAction": "urn:IPACCTipbill#ipbillAddUser"
  }
}).then(res => {
  console.log("Raw response:", res.data);
}).catch(err => {
  console.log("Error:", err.message);
});
