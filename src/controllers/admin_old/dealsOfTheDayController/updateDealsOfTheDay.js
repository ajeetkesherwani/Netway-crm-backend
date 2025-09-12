const DealsOfTheDay = require("../../../models_old/dealsOfTheDay");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.updateDealsOfTheDay = catchAsync(async (req, res) => {
  let id = req.params.id;
  let { serviceId, cat_id, product_id, discountType, discountValue } = req.body;

  const requiredFields = [
    { field: serviceId, name: "Service Id" },
    { field: cat_id, name: "Category ID" },
    { field: product_id, name: "Product ID" },
    { field: discountType, name: "Discount Type" },
    { field: discountValue, name: "Discount Value" },
  ];

  for (const { field, name } of requiredFields) {
    const error = validateRequiredField(field, name);
    if (error) return next(error);
  }

  let deals = await DealsOfTheDay.findOne({ _id: id });

  let imageNew = deals.image;
  if (req.files && req.files.image && req.files.image.length > 0) {
    // Delete the old primary image if available.
    if (deals.image) {
      await deleteOldFiles(deals.image);
    }
    imageNew = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
  }

  deals.serviceId = serviceId || deals.serviceId;
  deals.cat_id = cat_id || deals.cat_id;
  deals.product_id = product_id || deals.product_id;
  deals.discountType = discountType || deals.discountType;
  deals.discountValue = discountValue || deals.discountValue;
  deals.image = imageNew;

  await deals.save();
  message = "Deals Updated successfully";

  return res.status(201).json({
    status: true,
    message: message,
    data: { deals },
  });
});
