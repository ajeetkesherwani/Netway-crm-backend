const DealsOfTheDay = require("../../../models/dealsOfTheDay");
const Vendor = require("../../../models/vendor");
const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");

const customCategories = [
  { _id: "1", name: "Delivery Time" },
  { _id: "2", name: "Shop Rating" },
  { _id: "3", name: "Shop with offers" },
  { _id: "4", name: "Distance" },
  { _id: "5", name: "Fast Delivery" },
];

exports.getHomeData = catchAsync(async (req, res) => {
  const type = req.params.type || "all";
  const filter = type === "all" ? {} : { serviceId: type };
  const vendorFilter = {
    ...filter,
    status: true,
    isBlocked: false,
  };

  let deals = [];
  let allVendor = [];
  let categories = [];

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
