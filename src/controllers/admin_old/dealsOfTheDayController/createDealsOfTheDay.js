const DealsOfTheDay = require("../../../models_old/dealsOfTheDay");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.createDealsOfTheDay = catchAsync(async (req, res) => {
  console.log(req.body);
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

  let imagePath;
  if (req.files && req.files.image) {
    const url = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
    imagePath = url;
  } else {
    imagePath = "";
  }

  dealsCreate = new DealsOfTheDay({
    serviceId,
    cat_id,
    product_id,
    image: imagePath,
    discountType,
    discountValue,
  });
  message = "Deals added successfully";

  await dealsCreate.save();

  return res.status(201).json({
    status: true,
    message: message,
    data: { dealsCreate },
  });
});
