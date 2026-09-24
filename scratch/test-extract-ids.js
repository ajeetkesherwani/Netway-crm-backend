const { parseStringPromise } = require("xml2js");

const xml = `<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:tns="urn:IPACCTipbill"><SOAP-ENV:Body><ns1:ipbillAddUserResponse xmlns:ns1="urn:IPACCTipbill"><return xsi:type="tns:result"><id xsi:type="xsd:string">26</id><cid xsi:type="xsd:string">26001982</cid><code xsi:type="xsd:integer">0</code><message xsi:type="xsd:string">OK</message></return></ns1:ipbillAddUserResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>`;

async function run() {
  const json = await parseStringPromise(xml, { explicitArray: false });
  const envelope = json["SOAP-ENV:Envelope"] || json["soapenv:Envelope"];
  const body = envelope?.["SOAP-ENV:Body"] || envelope?.["soapenv:Body"];
  const ret = body["ns1:ipbillAddUserResponse"]?.return;

  console.log("ret:", JSON.stringify(ret, null, 2));

  // Extract id and cid
  const ipacctId = typeof ret.id === "object" ? (ret.id._ || ret.id) : ret.id;
  const ipacctCid = typeof ret.cid === "object" ? (ret.cid._ || ret.cid) : ret.cid;

  console.log("Extracted ipacctId:", ipacctId);
  console.log("Extracted ipacctCid:", ipacctCid);
}

run();
