const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

https.get('https://139.5.198.59:443/0/api?wsdl', { agent }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
}).on('error', e => console.error(e));
