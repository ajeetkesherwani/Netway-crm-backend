// const User = require("../../../../models/user");
// const Admin = require("../../../../models/admin");
// const PurchasedPlan = require("../../../../models/purchasedPlan");
// const AppError = require("../../../../utils/AppError");
// const catchAsync = require("../../../../utils/catchAsync");
// const { successResponse } = require("../../../../utils/responseHandler");
// const Reseller = require("../../../../models/retailer");
// const Lco = require("../../../../models/lco");

// // Helper to fetch createdBy name
// async function getCreatedByName(type, id) {
//   const modelMap = { Admin, Reseller, Lco };
//   if (!type || !id || !modelMap[type]) return null;
//   const doc = await modelMap[type].findById(id).select("name").lean();
//   return doc?.name || null;
// }

// async function getResellerLcoName(createdFor, id) {
//   let resellerName = null;
//   let lcoName = null;

//   if (createdFor === "Reseller") {
//     const reseller = await Reseller.findById(id).select("name").lean();
//     resellerName = reseller?.name || null;
//   }

//   if (createdFor === "Lco") {
//     const lco = await Lco.findById(id).select("name retailerId").lean();
//     if (lco) {
//       lcoName = lco.name || null;

//       if (lco.retailerId) {
//         const reseller = await Reseller.findById(lco.retailerId).select("name").lean();
//         resellerName = reseller?.name || null;
//       }
//     }
//   }

//   return { resellerName, lcoName };
// }



// exports.getAllSuspendedUsersList = catchAsync(async (req, res, next) => {
//   const { page = 1, limit = 10 } = req.query;
//   const skip = (parseInt(page) - 1) * parseInt(limit);

//   // Get total user count
//   const totalUsers = await User.countDocuments();

//   // Fetch paginated users
//   const users = await User.find({status: "Suspend"})
//     .select(`
//       generalInformation.username 
//       generalInformation.name 
//       generalInformation.phone 
//       generalInformation.email 
//       generalInformation.status 
//       generalInformation.gst 
//       generalInformation.address 
//       generalInformation.activationDate 
//       generalInformation.expiryDate 
//       generalInformation.createdBy 
//       generalInformation.createdFor 
//       createdAt
//       status
//     `)
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(parseInt(limit))
//     .lean();

//   const modifiedUsers = await Promise.all(
//     users.map(async (user) => {
//       const planData = await PurchasedPlan.findOne({
//         userId: user._id,
//         status: "active"
//       })
//         .populate("packageId", "name")
//         .select("packageId activationDate expiryDate")
//         .lean();

//       const createdByField = user.generalInformation?.createdBy;
//       const createdByName = await getCreatedByName(
//         createdByField?.type,
//         createdByField?.id
//       );

//       const createdForField = user.generalInformation?.createdFor;
//         const { resellerName, lcoName } = await getResellerLcoName(
//         createdForField?.type,
//         createdForField?.id
//       );

//       return {
//         id: user._id,
//         username: user.generalInformation?.username || null,
//         customerName: user.generalInformation?.name || null,
//         phone: user.generalInformation?.phone || null,
//         email: user.generalInformation?.email || null,
//         status: user?.status || null,
//         gstin: user.generalInformation?.gst || null,
//         area: user.generalInformation?.address || null,
//         createdAt: user.createdAt || null,
//         activationDate: planData?.activationDate || null,
//         expiryDate: planData?.expiryDate || null,
//         createdByType: createdByField?.type || null,
//         createdByName,
//         createdFor: user.generalInformation?.createdFor?.type || null,
//         planName: planData?.packageId?.name || null,
//         resellerName,
//         lcoName
//       };
//     })
//   );

//   return successResponse(res, "Users fetched successfully", {
//     total: totalUsers,
//     page: parseInt(page),
//     limit: parseInt(limit),
//     data: modifiedUsers
//   });
// });

const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");

// Helper to fetch createdBy name
async function getCreatedByName(type, id) {
  const modelMap = { Admin, Reseller, Lco };
  if (!type || !id || !modelMap[type]) return null;
  const doc = await modelMap[type].findById(id).select("name").lean();
  return doc?.name || null;
}

// Helper to fetch Reseller and LCO names
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
        const reseller = await Reseller.findById(lco.retailerId)
          .select("name")
          .lean();
        resellerName = reseller?.name || null;
      }
    }
  }

  return { resellerName, lcoName };
}

exports.getAllSuspendedUsersList = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, searchField, searchValue } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // 🔍 Build filter for suspended users
  const filter = { status: "Suspend" };

  // If filter field/value provided, handle it
  if (searchField && searchValue) {
    const allowedFields = [
      "username",
      "customerName",
      "email",
      "phone",
      "resellerName",
      "lcoName"
    ];

    if (!allowedFields.includes(searchField)) {
      return next(new AppError("Invalid search field provided", 400));
    }

    // Direct filters (in User model)
    const directFieldMap = {
      username: "generalInformation.username",
      customerName: "generalInformation.name",
      email: "generalInformation.email",
      phone: "generalInformation.phone"
    };

    if (directFieldMap[searchField]) {
      filter[directFieldMap[searchField]] = {
        $regex: searchValue,
        $options: "i"
      };
    } else if (searchField === "resellerName") {
      // 🧩 Lookup Resellers matching searchValue
      const matchingResellers = await Reseller.find({
        name: { $regex: searchValue, $options: "i" }
      })
        .select("_id")
        .lean();

      const resellerIds = matchingResellers.map((r) => r._id.toString());

      // Match users createdFor = Reseller or createdFor = Lco with retailerId in that list
      const matchingLcos = await Lco.find({
        retailerId: { $in: resellerIds }
      })
        .select("_id")
        .lean();

      const lcoIds = matchingLcos.map((l) => l._id.toString());

      filter.$or = [
        { "generalInformation.createdFor.id": { $in: resellerIds } },
        { "generalInformation.createdFor.id": { $in: lcoIds } }
      ];
    } else if (searchField === "lcoName") {
      // 🧩 Lookup LCOs matching searchValue
      const matchingLcos = await Lco.find({
        name: { $regex: searchValue, $options: "i" }
      })
        .select("_id")
        .lean();

      const lcoIds = matchingLcos.map((l) => l._id.toString());

      filter["generalInformation.createdFor.id"] = { $in: lcoIds };
    }
  }

  // Get total filtered suspended users count
  const totalUsers = await User.countDocuments(filter);

  // Fetch paginated users
  const users = await User.find(filter)
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
        createdFor: createdForField?.type || null,
        planName: planData?.packageId?.name || null,
        resellerName,
        lcoName
      };
    })
  );

  return successResponse(res, "Suspended users fetched successfully", {
    total: totalUsers,
    page: parseInt(page),
    limit: parseInt(limit),
    data: modifiedUsers
  });
});
