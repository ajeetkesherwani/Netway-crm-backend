const https = require('https');

const agent = new https.Agent({ 
  rejectUnauthorized: false
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

fetch('https://103.255.232.146:443/0/bgpost', {
  method: 'POST',
  body: xml,
  dispatcher: new (require('undici').Agent)({
    connect: { rejectUnauthorized: false }
  }),
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': 'urn:IPACCTipbill#ipbillAddUser'
  }
}).then(res => res.text()).then(text => console.log('FETCH RESPONSE:', text)).catch(e => console.log('FETCH ERROR:', e.message));
