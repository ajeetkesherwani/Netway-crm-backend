// services/soapClient.js
const axios = require("axios");
const { parseStringPromise } = require("xml2js");
const config = require("../config/ipacctConfig");

const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function callSoap(method, params = {}) {
  // convert params → XML
  let paramsXML = "";
  for (let key in params) {
    paramsXML += `<${key}>${params[key]}</${key}>`;
  }

  // SOAP body
  const xml = `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="${config.NAMESPACE}">
    <soapenv:Header/>
    <soapenv:Body>
      <urn:${method}>
        ${paramsXML}
      </urn:${method}>
    </soapenv:Body>
  </soapenv:Envelope>
  `;

  try {
    const res = await axios.post(config.ENDPOINT, xml, {
      httpsAgent: agent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `"${config.NAMESPACE}#${method}"`
      }
    });

    // 🔹 XML → JSON
    const json = await parseStringPromise(res.data, {
      explicitArray: false
    });

    return json;

  } catch (err) {
    console.error("SOAP ERROR:", err.message);
    throw err;
  }
}

module.exports = { callSoap };