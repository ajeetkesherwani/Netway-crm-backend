const https = require('https');

function checkWsdl(url) {
  https.get(url, { agent: new https.Agent({ rejectUnauthorized: false }) }, (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const operations = [];
      const regex = /<operation name=\"([^\"]+)\"/g;
      let match;
      while ((match = regex.exec(data)) !== null) {
        operations.push(match[1]);
      }
      const uniqueOps = [...new Set(operations)];
      console.log(`\n--- Operations in ${url} ---`);
      console.log('Package ops:', uniqueOps.filter(o => o.toLowerCase().includes('package')).join(', '));
      console.log('Zone ops:', uniqueOps.filter(o => o.toLowerCase().includes('zone')).join(', '));
    });
  });
}

checkWsdl('https://139.5.198.58:443/0/bgpost?wsdl');
checkWsdl('https://139.5.198.59:443/0/api?wsdl');
