const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
const AssignPackage = require("../../../../models/assignPackage");

// Helper to fetch createdBy name
async function getCreatedByName(type, id) {
  const modelMap = { Admin, Reseller, Lco };
  if (!type || !id || !modelMap[type]) return null;
  const doc = await modelMap[type].findById(id).select("name").lean();
  return doc?.name || null;
}

async function getResellerLcoName(createdFor, id) {
  let resellerName = null;
  let lcoName = null;

  if (createdFor === "Reseller") {
    const reseller = await Reseller.findById(id).select("name").lean();
    resellerName = reseller?.name || null;
  }

  if (createdFor === "Lco") {
    const lco = await Lco.findById(id).select("name retailerId").lean();
    if (lco) {
      lcoName = lco.name || null;

      if (lco.retailerId) {
        const reseller = await Reseller.findById(lco.retailerId).select("name").lean();
        resellerName = reseller?.name || null;
      }
    }
  }

  return { resellerName, lcoName };
}

async function getPlanPrice(userId) {
  let planPrice = null;

  // Find the user's active plan
  const planData = await PurchasedPlan.findOne({
    userId,
    status: "active"
  }).populate("packageId").lean();

//   console.log("planData",planData);

  if (!planData || !planData.packageId) {
    return { planPrice };
  }

  // Find the user to check who created them
  const user = await User.findById(userId)
    .select("generalInformation.createdFor")
    .lean();

  const createdFor = user?.generalInformation?.createdFor;
  const packageId = planData.packageId;

  console.log("createdFor",createdFor);
  // If created by Admin, return base package price
  if (createdFor?.type === "Admin") {
    const packageDoc = await Package.findById(packageId).select("basePrice").lean();
    planPrice = packageDoc?.basePrice ?? null;
  }

  // If created by Reseller or Lco, return assigned price
  let roleType = "";
  if (["Retailer", "Lco"].includes(createdFor?.type)) {
    if(createdFor.type == 'Retailer'){
        roleType = "Reseller";
    }
    else{
        roleType = "Lco";
    }


    const assigned = await AssignPackage.findOne({
      assignTo: roleType,
      assignToId: createdFor.id,
      "packages.packageId": packageId
    }, {
      "packages.$": 1 // only the matched package
    }).lean();

    console.log("assigned",assigned);
    const assignedPackage = assigned?.packages?.[0];
    planPrice = assignedPackage?.price ?? null;
  }
  console.log("planPrice",planPrice);

  return { planPrice };
}

exports.newRegistrationPlanReport = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total user count
  const totalUsers = await User.countDocuments();

  // Fetch paginated users
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // 00:00:00.000

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // 23:59:59.999

    const users = await User.find({
    createdAt: {
        $gte: startOfToday,
        $lt: endOfToday
    }
    })
    .select(`
        generalInformation.username 
        generalInformation.name 
        generalInformation.phone 
        generalInformation.email 
        generalInformation.status 
        generalInformation.gst 
        generalInformation.address 
        generalInformation.activationDate 
        generalInformation.expiryDate 
        generalInformation.createdBy 
        generalInformation.createdFor 
        createdAt
        status
    `)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    console.log("user",users);

  const modifiedUsers = await Promise.all(
    users.map(async (user) => {
      const planData = await PurchasedPlan.findOne({
        userId: user._id,
        status: "active"
      })
        .populate("packageId", "name")
        .select("packageId activationDate expiryDate")
        .lean();

      const createdByField = user.generalInformation?.createdBy;
      const createdByName = await getCreatedByName(
        createdByField?.type,
        createdByField?.id
      );

      const createdForField = user.generalInformation?.createdFor;
        const { resellerName, lcoName } = await getResellerLcoName(
        createdForField?.type,
        createdForField?.id
      );

        const {planPrice} = await getPlanPrice(user._id);
        const gstValue = planPrice * 18 / 100;
        const finalAmount = planPrice + gstValue; // This is what customer pays


      return {
        id: user._id,
        username: user.generalInformation?.username || null,
        customerName: user.generalInformation?.name || null,
        phone: user.generalInformation?.phone || null,
        email: user.generalInformation?.email || null,
        status: user?.status || null,
        gstin: user.generalInformation?.gst || null,
        area: user.generalInformation?.address || null,
        createdAt: user.createdAt || null,
        activationDate: planData?.activationDate || null,
        expiryDate: planData?.expiryDate || null,
        createdByType: createdByField?.type || null,
        createdByName,
        createdFor: user.generalInformation?.createdFor?.type || null,
        planName: planData?.packageId?.name || null,
        planPrice: planPrice || null,
        gst:gstValue || null,
        finalAmount:finalAmount || null,
        resellerName,
        lcoName
      };
    })
  );

  return successResponse(res, "Users fetched successfully", {
    total: totalUsers,
    page: parseInt(page),
    limit: parseInt(limit),
    data: modifiedUsers
  });
});

