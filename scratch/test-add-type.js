const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config();

async function testAdd() {
  try {
    const userXml = `
      <id>0</id>
      <name>ARYA9999</name>
      <fee>0</fee>
      <ifee>0</ifee>
      <address>123</address>
      <phone>123456</phone>
      <mobile>123456</mobile>
      <idid>ARYA9999</idid>
      <enddateisnull>true</enddateisnull>
      <stopped>n</stopped>
      <pass>123456</pass>
      <fuppackageid>0</fuppackageid>
      <tcpmax>0</tcpmax>
      <packagetype>c</packagetype>
      <packageid>254</packageid>
      <email>arya@gmail.com</email>
      <ttl>0</ttl>
      <createdateisnull>true</createdateisnull>
      <zoneid>29</zoneid>
      <havecontract>false</havecontract>
      <contractdateisnull>true</contractdateisnull>
    `;

    const paramsXML = `
      <user>${process.env.IPACCT_USER}</user>
      <pass>${process.env.IPACCT_PASS}</pass>
      <id>0</id>
      <u xsi:type="tns:user">${userXml}</u>
    `;

    const config = require("../src/config/ipacctConfig");
    const https = require("https");
    const { parseStringPromise } = require("xml2js");

    const xml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${config.NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="urn:IPACCTipbill">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:ipbillAddUser>
          ${paramsXML}
        </urn:ipbillAddUser>
      </soapenv:Body>
    </soapenv:Envelope>
    `;

    const agent = new https.Agent({ rejectUnauthorized: false });
    const url = new URL(config.ENDPOINT);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "POST",
      agent: agent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Content-Length": Buffer.byteLength(xml, "utf8"),
        "SOAPAction": '"urn:IPACCTipbill#ipbillAddUser"'
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => console.log("Response:", data));
    });
    req.write(xml);
    req.end();

  } catch (err) {
    console.error("Error:", err.message);
  }
}

testAdd();
