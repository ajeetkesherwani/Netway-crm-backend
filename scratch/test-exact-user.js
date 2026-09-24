const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const { addIpacctUser } = require("../src/services/ipacctUserServices");

async function testExact() {
  const data = {
    name: 'pradeep01',
    address: 'noida',
    pin: '098765',
    phone: '7383632575',
    mobile: '7383632575',
    username: 'PRADEEP_' + Math.floor(1000 + Math.random() * 9000),
    password: '123456',
    email: 'pradeep@gmail.com',
    packageId: '1',
    packageName: 'TEST 1000 Mbps',
    fee: '699',
    expiryDate: new Date('2026-02-08T18:30:00.000Z'),
    zoneid: 1,
    zonename: 'TEST',
    ipAdress: '100.64.40.2',
    poolId: 'TEST 100.64.40.1/24'
  };

  const res = await addIpacctUser(data);
  console.log("Response with 100.64.40.2:", res);
}

testExact();
