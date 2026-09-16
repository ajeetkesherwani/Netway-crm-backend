const { parseStringPromise } = require("xml2js");
const config = require("../config/ipacctConfig");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function callSoap(method, params = {}, rawParamsXML = "") {
  // convert params → XML
  let paramsXML = "";
  for (let key in params) {
    paramsXML += `<${key}>${params[key]}</${key}>`;
  }
  paramsXML += rawParamsXML;

  // SOAP body
  const xml = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${config.NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tns="urn:IPACCTipbill">
    <soapenv:Header/>
    <soapenv:Body>
      <urn:${method}>
        ${paramsXML}
      </urn:${method}>
    </soapenv:Body>
  </soapenv:Envelope>
  `;

  return new Promise((resolve, reject) => {
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
        "SOAPAction": `"${config.NAMESPACE}#${method}"`
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", async () => {
        try {
          const json = await parseStringPromise(data, {
            explicitArray: false
          });
          resolve(json);
        } catch (err) {
          console.error("XML Parsing Error:", err.message);
          resolve(data); // Return raw if parsing fails
        }
      });
    });

    req.on("error", (err) => {
      console.error("SOAP ERROR:", err.message);
      reject(err);
    });

    req.write(xml);
    req.end();
  });
}

module.exports = { callSoap };