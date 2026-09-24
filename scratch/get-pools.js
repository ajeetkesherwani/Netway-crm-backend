const https = require('https');
const { parseStringPromise } = require('xml2js');
const agent = new https.Agent({ rejectUnauthorized: false });

const xml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:IPACCTipacct" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="urn:IPACCTipacct">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:ipbillGetPools>
      <user>pradeep</user>
      <pass>admin@2026</pass>
      <ipacctid>1</ipacctid>
      <zoneid>1</zoneid>
    </urn:ipbillGetPools>
  </soapenv:Body>
</soapenv:Envelope>`;

const req = https.request({
  hostname: '139.5.198.58',
  port: 443,
  path: '/0/api',
  method: 'POST',
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': 'urn:IPACCTipacct#ipbillGetPools',
    'Content-Length': Buffer.byteLength(xml)
  },
  agent
}, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', async () => {
    try {
      const json = await parseStringPromise(data, { explicitArray: false });
      console.log(JSON.stringify(json, null, 2));
    } catch(e) { console.log(data); }
  });
});
req.write(xml);
req.end();
