const User = require("../../../../models/user");
const Admin = require("../../../../models/admin");
const PurchasedPlan = require("../../../../models/purchasedPlan");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
// const PurchasedPlan = require("../../../../models/purchasedPlan")

exports.customerBalanceReport = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await User.countDocuments();

  const userData = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
console.log("userData",userData);
    const mappedTransactions = await Promise.all(userData.map(async (usr) => {
        let adminName = "";
        let resellerName = "";
        let lcoName = "";
        console.log(usr.generalInformation.createdFor);
        if(usr.generalInformation.createdFor){
            switch (usr.generalInformation.createdFor.type) {
                case "Admin":
                    const admin = Admin.findById(usr.generalInformation.createdFor.id).select("name").lean();
                    adminName = admin.name;
                    break;
                case "Retailer":
                    const reseller = Reseller.findById(usr.generalInformation.createdFor.id).select("resellerName").lean();
                    resellerName = reseller.resellerName;
                    break;
                case "Lco":
                    const lco = Lco.findById(usr.generalInformation.createdFor.id).populate("retailerId","resellerName").select("lcoName").lean();
                    lcoName = lco.lcoName;
                    resellerName = lco.retailerId.resellerName;
                    break;
                case "Self":
                
                    break;
                default:
                    break;
            }
        }

        // const purchasedPlan = PurchasedPlan.find({userId:usr._id, status:"active"}).lean();
        // console.log("purchasedPlan",purchasedPlan);

    return {
      ...usr,
      adminName,
      resellerName,
      lcoName
    };
  }));

  return successResponse(res, "Transactions fetched successfully", {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    data: mappedTransactions
  });
});



