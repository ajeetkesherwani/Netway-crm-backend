const { callSoap } = require('../src/utils/soapApi');
const userXml = `
  <id>0</id>
  <name>John Doe</name>
  <fee>0</fee>
  <ifee>0</ifee>
  <address>123 St</address>
  <phone>123456</phone>
  <mobile>123456</mobile>
  <pid></pid>
  <idid>johndoe</idid>
  <enddate></enddate>
  <enddateisnull>true</enddateisnull>
  <stopped></stopped>
  <pass>pass123</pass>
  <fuppackageid>0</fuppackageid>
  <tcpmax>0</tcpmax>
  <packagetype></packagetype>
  <packageid>254</packageid>
  <packagename></packagename>
  <comment></comment>
  <email>john@example.com</email>
  <volumelimitat></volumelimitat>
  <volumenow></volumenow>
  <ttl>0</ttl>
  <createdate></createdate>
  <createdateisnull>true</createdateisnull>
  <zoneid>29</zoneid>
  <zonename></zonename>
  <zoneadr></zoneadr>
  <zonepho></zonepho>
  <zonecomment></zonecomment>
  <zonepubname></zonepubname>
  <zonepubadr></zonepubadr>
  <zonepubpho></zonepubpho>
  <ips></ips>
  <havecontract>false</havecontract>
  <contractno></contractno>
  <contractdate></contractdate>
  <contractdateisnull>true</contractdateisnull>
  <contractdata></contractdata>
  <lastwarn></lastwarn>
`;

callSoap('ipbillAddUser', { 
  user: 'vibashcrm', 
  pass: '5tr0ngP60pl3', 
  id: '', 
  u: userXml 
})
  .then(res => console.log('SUCCESS RESPONSE:', JSON.stringify(res, null, 2)))
  .catch(err => console.log('ERROR RESPONSE:', err.message));
