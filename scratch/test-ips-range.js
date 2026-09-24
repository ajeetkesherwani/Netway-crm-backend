const { addIpacctUser } = require("../src/services/ipacctUserServices");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

async function testVariousIps() {
  for (const ip of ["100.64.40.3", "100.64.40.10", "100.64.40.55", ""]) {
    console.log(`\nTesting with IP: '${ip}'`);
    const data = {
      name: 'pradeep test',
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
      ipAdress: ip,
      poolId: 1
    };

    const res = await addIpacctUser(data);
    const ret = res?.return;
    const id = typeof ret?.id === 'object' ? ret.id._ : ret?.id;
    const cid = typeof ret?.cid === 'object' ? ret.cid._ : ret?.cid;
    const msg = typeof ret?.message === 'object' ? ret.message._ : ret?.message;
    console.log(`-> IP: '${ip}' => id: ${id}, cid: ${cid}, msg: ${msg}`);
  }
}

testVariousIps();
