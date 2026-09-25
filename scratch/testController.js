require("dotenv").config({ path: "./config.env" });
const { listIpacctUsersController } = require("../src/controllers/admin/IpacctApis/ipBillListUsers");

async function testPostSearch() {
  const req = {
    query: {},
    body: {
      search: "ajay"
    }
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`Status: ${this.statusCode}`);
      console.log("Total matched:", data.total);
      console.log("Names:", data.data?.map(u => ({ id: u.id, name: u.name, mobile: u.mobile, ip: u.ips?.item?.ip })));
    }
  };

  await listIpacctUsersController(req, res);
}

testPostSearch();
