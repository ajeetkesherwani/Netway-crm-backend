const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const PriceBook = require("../../../models/priceBook");
const catchAsync = require("../../../utils/catchAsync");

exports.getHomeData = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  let createdModal = '';
  let packages = '';

  // Find active purchased plan
  const purchasedPlan = await PurchasedPlan.findOne({
    userId: user._id,
    status: "active"
  }).populate(
    "packageId",
    "name validity basePrice offerPrice typeOfPlan categoryOfPlan isOtt isIptv"
  );

  switch (user.generalInformation.createdFor.type) {
    case "Admin":
        createdModal = Admin.findById(user.generalInformation.createdFor.id);
        // Fetch all active packages
        const packageData = await Package.find({ status: "active" });

        // Map the data to only return required fields
        packages = packageData.map(pkg => ({
          planName: pkg.name,
          validity: pkg.validity,
          basePrice: pkg.basePrice,
          offerPrice: pkg.offerPrice,
          typeOfPlan: pkg.typeOfPlan,
          categoryOfPlan: pkg.categoryOfPlan,
          isIptv: pkg.isIptv,
          isOtt: pkg.isOtt
        }));
      break;
    case "Retailer":
      createdModal = Retailer.findById(user.generalInformation.createdFor.id);
      const assignPackage = PriceBook.find({priceBookFor: "Reseller", assignedTo: createdModal._id});
      break;
    case "Lco":
      createdModal = Lco.findById(user.generalInformation.createdFor.id);
      break;
  }
  



  // const packages = Packages.find

  try {
    deals = await DealsOfTheDay.find(filter).sort({ createdAt: -1 }).exec();
    allVendor = await Vendor.find(vendorFilter)
      .select("_id shopName shopId serviceId shopAddress shopImages ") // include only these fields
      .sort({ createdAt: -1 })
      .populate("serviceId", "name")
      .exec();

    if (type === "all") {
      categories = customCategories;
    } else {
      categories = await Category.find({
        serviceId: type,
        cat_id: { $exists: false },
      })
        .select("name")
        .exec();
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching data.",
      error: error.message,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Home data fetched successfully",
    data: {
      dealsOfTheDay: deals,
      ShopList: allVendor,
      categories: categories, // Add categories later if you want
    },
  });
});
