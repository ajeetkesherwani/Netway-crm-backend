// const User = require("../../../models/user");
// const PurchasedPlan = require("../../../models/purchasedPlan");
// // const Package = require("../../../models/package");
// const Package = require("../../../models/Package");
// const Retailer = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const PriceBook = require("../../../models/priceBook");
// const Admin = require("../../../models/admin");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getHomeData = catchAsync(async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     let createdModal;
//     let packages = [];
//     let priceBooks = [];

//     // console.log("user._id", user._id);
//   console.log("user", "home datauser");

//     // Find active purchased plan
//     const purchasedPlan = await PurchasedPlan.findOne({
//       userId: user._id,
//       status: "active",
//     }).populate("packageId", "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv");
//      console.log("purchasedPlan", purchasedPlan);

//      if(!purchasedPlan){
//       console.log("No active purchased plan found for user:", user._id);
//      }

//     console.log("user.generalInformation", user.generalInformation);
//     console.log("user.generalInformation.createdFor.type", user.generalInformation.createdFor.type);

//     // Fetch data based on createdFor type
//     switch (user.generalInformation.createdFor.type) {
//       case "Admin":
//         createdModal = await Admin.findById(user.generalInformation.createdFor.id);

//         // Fetch all active packages for Admin
//         const packageData = await Package.find({ status: "active" });


//         // Map data to required fields
//         packages = packageData.map((pkg) => ({
//           id: pkg._id,
//           planName: pkg.name,
//           validity: pkg.validity,
//           basePrice: pkg.basePrice,
//           offerPrice: pkg.offerPrice,
//           typeOfPlan: pkg.typeOfPlan,
//           categoryOfPlan: pkg.categoryOfPlan,
//           isIptv: pkg.isIptv,
//           isOtt: pkg.isOtt,
//         }));
//         break;

//       case "Retailer":
//         createdModal = await Retailer.findById(user.generalInformation.createdFor.id);

//         // Fetch PriceBooks for Retailer
//         priceBooks = await PriceBook.find({
//           priceBookFor: "Reseller",
//           assignedTo: createdModal._id,
//         }).populate("package.packageId", "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv");

//         // Map all packages from all PriceBooks
//         priceBooks.forEach((pb) => {
//           pb.package.forEach((pkg) => {
//             if (pkg.status === "active" && pkg.packageId) {
//               packages.push({
//                 id: pkg.packageId._id,
//                 planName: pkg.packageId.name,
//                 validity: pkg.packageId.validity,
//                 basePrice: pkg.packageId.basePrice,
//                 offerPrice: pkg.packageId.offerPrice,
//                 typeOfPlan: pkg.packageId.typeOfPlan,
//                 categoryOfPlan: pkg.packageId.categoryOfPlan,
//                 isIptv: pkg.packageId.isIptv,
//                 isOtt: pkg.packageId.isOtt,
//               });
//             }
//           });
//         });
//         break;

//       case "Lco":
//         createdModal = await Lco.findById(user.generalInformation.createdFor.id);

//         // Fetch PriceBooks for LCO
//         priceBooks = await PriceBook.find({
//           priceBookFor: "Lco",
//           assignedTo: createdModal._id,
//         }).populate("package.packageId", "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv");

//         // Map all packages from all PriceBooks
//         priceBooks.forEach((pb) => {
//           pb.package.forEach((pkg) => {
//             if (pkg.status === "active" && pkg.packageId) {
//               packages.push({
//                 id: pkg.packageId._id,
//                 planName: pkg.packageId.name,
//                 validity: pkg.packageId.validity,
//                 basePrice: pkg.packageId.basePrice,
//                 offerPrice: pkg.packageId.offerPrice,
//                 typeOfPlan: pkg.packageId.typeOfPlan,
//                 categoryOfPlan: pkg.packageId.categoryOfPlan,
//                 isIptv: pkg.packageId.isIptv,
//                 isOtt: pkg.packageId.isOtt,
//               });
//             }
//           });
//         });
//         break;
//     }

//     // Group packages by categoryOfPlan
//     const groupedPackages = packages.reduce((acc, pkg) => {
//       const category = pkg.categoryOfPlan;
//       if (!acc[category]) {
//         acc[category] = [];
//       }
//       acc[category].push(pkg);
//       return acc;
//     }, {});

//     // Convert grouped data into array format
//     const finalPackages = Object.keys(groupedPackages).map((category) => ({
//       categoryOfPlan: category,
//       packages: groupedPackages[category],
//     }));



    

//     return res.status(200).json({
//       success: true,
//       message: "Home data fetched successfully",
//       data: {
//         purchasedPlan: purchasedPlan,
//         packageData: finalPackages,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching home data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching home data.",
//       error: error.message,
//     });
//   }
// });


const User = require("../../../models/user");
const UserPackage = require("../../../models/userPackage");
const PurchasedPlan = require("../../../models/purchasedPlan");
// const Package = require("../../../models/package");
const Package = require("../../../models/package");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const PriceBook = require("../../../models/priceBook");
const Admin = require("../../../models/admin");
const catchAsync = require("../../../utils/catchAsync");

exports.getHomeData = catchAsync(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

  console.log("user", "home datauser");

    // Find active purchased plan
    const purchasedPlan = await PurchasedPlan.findOne({
      userId: user._id,
      status: "active",
    }).populate(
      "packageId",
      "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv"
    );

    // Fetch user assigned packages only
    const assignedPackages = await UserPackage.find({
      userId: user._id,
      status: "active",
    })
    .populate(
      "packageId",
      "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv"
    );

    // console.log("assignedPackages", assignedPackages);

    // Map assigned packages to packageData format
    const packagesMap = {};

    assignedPackages.forEach((p) => {
      const pkg = p.packageId;
      if (!pkg) return;

      const category = pkg.categoryOfPlan || "Uncategorized";

      if (!packagesMap[category]) {
        packagesMap[category] = [];
      }

      packagesMap[category].push({
        id: pkg._id,
        planName: pkg.name,
        validity: pkg.validity,
        basePrice: pkg.basePrice,
        offerPrice: pkg.offerPrice,
        typeOfPlan: pkg.typeOfPlan,
        categoryOfPlan: pkg.categoryOfPlan,
        isIptv: pkg.isIptv,
        isOtt: pkg.isOtt,
      });
    });

    const finalPackages = Object.keys(packagesMap).map((category) => ({
      categoryOfPlan: category,
      packages: packagesMap[category],
    }));

    return res.status(200).json({
      success: true,
      message: "Home data fetched successfully",
      data: {
        purchasedPlan: purchasedPlan, // same as before
        packageData: finalPackages,   // only assigned packages
        walletBalance: (user.walletBalance <= 0) ? user.walletBalance : 0, // return 0 if wallet balance is positive 
      },
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching home data.",
      error: error.message,
    });
  }
});
