const https = require('https');
const fs = require('fs');

const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://103.255.232.146:443/0/bgpost?wsdl', { agent }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => fs.writeFileSync('./scratch/wsdl.xml', data));
}).on('error', (e) => {
  console.error(e);
});
