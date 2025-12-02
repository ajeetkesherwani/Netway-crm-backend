const Product = require("../../../models/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");
const { successResponse } = require("../../../utils/responseHandler");

exports.getProduct = catchAsync(async (req, res) => {
  const vendorId = req.vendor._id;

  // Get pagination params from query
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  // Define populate options
  const populate = [
    { path: "serviceId", select: "name status image" },
    { path: "categoryId", select: "name" },
    { path: "subCategoryId", select: "name" },
    { path: "vendor", select: "shopName shopId mobile profileImg" },
  ];

  // Use paginate utility
  const paginatedResult = await paginate(
    Product,
    { vendor: vendorId },
    {
      page,
      limit,
      populate,
    }
  );

  if (
    !paginatedResult.paginateData ||
    paginatedResult.paginateData.length === 0
  ) {
    throw new AppError("No products found for this vendor", 404);
  }

  return successResponse(
    res,
    "All products found for the vendor",
    paginatedResult
  );
});
