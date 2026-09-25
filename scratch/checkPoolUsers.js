require("dotenv").config({ path: "./config.env" });
const { listIpacctUsers } = require("../src/services/ipacctUserServices");

async function checkUsers() {
  const res = await listIpacctUsers({ zoneid: 0 });
  const usersWithPools = res.users.filter(u => {
    const item = u.ips?.item;
    if (!item) return false;
    const pools = Array.isArray(item) ? item.map(i => i.pools) : [item.pools];
    return pools.some(p => p && Object.keys(p).length > 0);
  });

  console.log(`Found ${usersWithPools.length} users with pools.`);
  usersWithPools.slice(0, 5).forEach(u => {
    const item = Array.isArray(u.ips.item) ? u.ips.item[0] : u.ips.item;
    console.log({
      id: u.id,
      name: u.name,
      ips_ip: item?.ip,
      ips_staticip: item?.staticip,
      pools: item?.pools
    });
  });
}

checkUsers();
