// const User = require("../../../../models/user");
// const AppError = require("../../../../utils/AppError");
// const catchAsync = require("../../../../utils/catchAsync");
// const { successResponse } = require("../../../../utils/responseHandler");

// exports.getAllInactiveUsersList = catchAsync(async(req, res, next) => {
//     const id = req.user;
    
//     const user = await User.find({status: "Inactive"}).populate('roleId', 'name').select('-password -__v');
//     if(!user) return next(new AppError("user not found",404));

//     successResponse(res, "user found successfully", user);

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



exports.getAllInactiveUsersList = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total user count
  const totalUsers = await User.countDocuments();

  // Fetch paginated users
  const users = await User.find({status: "Inactive"})
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
        createdFor: user.generalInformation?.createdFor?.type || null,
        planName: planData?.packageId?.name || null,
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

