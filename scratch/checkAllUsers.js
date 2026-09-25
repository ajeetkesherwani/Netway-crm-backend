require("dotenv").config({ path: "./config.env" });
const { listIpacctUsers } = require("../src/services/ipacctUserServices");

async function checkAllUsers() {
  const res = await listIpacctUsers({ zoneid: 0 });
  res.users.forEach(u => {
    const item = Array.isArray(u.ips?.item) ? u.ips.item[0] : u.ips?.item;
    console.log(`User ${u.id} (${u.name}): ip="${item?.ip || ''}", staticip="${item?.staticip || ''}", pools=${JSON.stringify(item?.pools || {})}`);
  });
}

checkAllUsers();
