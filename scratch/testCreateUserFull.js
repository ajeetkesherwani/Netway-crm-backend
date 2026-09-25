require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const { createUser } = require("../src/controllers/admin/user/CreateUser");
const { listIpacctUsers } = require("../src/services/ipacctUserServices");

async function testFullCreate() {
  await mongoose.connect(process.env.DB_URL);

  const testName = "autopool_" + Math.floor(Math.random() * 1000);
  const testUserId = "uid_" + Math.floor(Math.random() * 1000);

  const req = {
    user: {
      _id: "68b9250b94b90332eaf43e22",
      role: "Admin"
    },
    body: {
      customer: JSON.stringify({
        title: "Mr",
        name: testName,
        billingName: testName,
        UserId: testUserId,
        gender: "Male",
        password: "password123",
        email: `${testName}@test.com`,
        mobile: "9876543210",
        connectionType: "ill",
        serviceOpted: "broadband",
        installationBy: ["68d6577b997bb805e7ca5a85"],
        pool: "2", // Frontend passes pool ID "2"
        ipAddress: "",
        packages: [{
          packageId: "6937b00533a0df842d6d13f9",
          packageName: "TEST 1000 Mbps",
          packageAmount: "699"
        }]
      }),
      addresses: JSON.stringify({
        billing: {
          addressLine1: "Noida sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        },
        permanent: {
          addressLine1: "Noida sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        },
        installation: {
          sameAsBilling: true,
          addressLine1: "Noida sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        }
      }),
      payment: JSON.stringify({
        paymentMode: "Cash"
      }),
      additional: JSON.stringify({
        dob: "2000-01-01"
      }),
      area: "6ab39dd48722c592c0820aa5", // NOIDA zone
      subZone: "6aaa565284401bbf6863741b"
    },
    files: {}
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log("\n=== RESPONSE DATA FROM CREATE USER ===");
      console.log("Success:", data.success);
      console.log("Customer Name:", data.data?.generalInformation?.name);
      console.log("Customer Pool in Mongo:", data.data?.generalInformation?.pool);
      console.log("Customer DynamicIpPool in Mongo:", data.data?.networkInformation?.dynamicIpPool);
      console.log("Customer IP in Mongo:", data.data?.generalInformation?.ipAdress);
      console.log("IPACCT ID:", data.data?.generalInformation?.ipactId);
      console.log("IPACCT Customer ID:", data.data?.generalInformation?.ipacctCustomerId);
    }
  };

  const next = (err) => {
    console.error("NEXT ERR:", err);
  };

  await createUser(req, res, next);

  const ipacctRes = await listIpacctUsers({ search: testName });
  const ipacctUser = ipacctRes.users[0];
  console.log("\n=== SAVED IN IPACCT ===");
  console.log("IPACCT User ID:", ipacctUser?.id);
  console.log("IPACCT Name:", ipacctUser?.name);
  console.log("IPACCT Zone:", ipacctUser?.zoneid, ipacctUser?.zonename);
  console.log("IPACCT IP:", ipacctUser?.ips?.item?.ip);
  console.log("IPACCT Pool:", JSON.stringify(ipacctUser?.ips?.item?.pools || ipacctUser?.ips, null, 2));

  await mongoose.disconnect();
}

testFullCreate();
