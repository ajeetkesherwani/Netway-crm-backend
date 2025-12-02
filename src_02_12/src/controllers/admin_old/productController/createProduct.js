const Product = require("../../../models_old/products");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};
const generateSKU = (prefix = "PRE", length = 6) => {
  const randomString = Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.T]/g, "")
    .slice(0, 14); // YYYYMMDDHHMMSS

  return `${prefix}-${timestamp}-${randomString}`;
};

exports.createProduct = catchAsync(async (req, res) => {
  console.log(req.body);
  try {
    const {
      vendor,
      serviceId,
      categoryId,
      subCategoryId,
      fabricId,
      name,
      primary_image,
      gallery_images,
      price,
      discountedPrice,
      returnAvailable,
      exchangeAvailable,
      variants,
      shortDiscription,
      longDiscription,
      tags,
    } = req.body;

    const requiredFields = [
      { field: vendor, name: "vendor Id" },
      { field: serviceId, name: "Service ID" },
      { field: categoryId, name: "Category ID" },
      { field: subCategoryId, name: "Subcategory Id" },
      { field: name, name: "Name" },
      { field: primary_image, name: "Primary Image" },
      { field: price, name: "Price" },
      { field: discountedPrice, name: "discountedPrice" },
      { field: returnAvailable, name: "returnAvailable" },
      { field: exchangeAvailable, name: "exchangeAvailable" },
      { field: variants, name: "variants" },
      { field: shortDiscription, name: "Short Description" },
      { field: longDiscription, name: "Long Description" },
      { field: tags, name: "Tags" },
    ];

    let primary_imagePath;
    if (req.files && req.files.primary_image) {
      const url = `${req.files.primary_image[0].destination}/${req.files.primary_image[0].filename}`;
      primary_imagePath = url;
    } else {
      primary_imagePath = "";
    }

    let galleryimagePaths;
    if (req.files && req.files.gallery_images) {
      const imagesUrls = req.files.gallery_images.map((file) => {
        return `${file.destination}/${file.filename}`;
      });
      galleryimagePaths = imagesUrls;
    }
    // let variants = [];
    parsedVariants = JSON.parse(variants);

    const product = new Product({
      vendor,
      serviceId,
      categoryId,
      subCategoryId,
      fabricId,
      name,
      primary_image: primary_imagePath,
      gallery_images: galleryimagePaths || [],
      price,
      discountedPrice,
      returnAvailable,
      exchangeAvailable,
      variants: parsedVariants,
      // varients: Array.isArray(variants),
      shortDiscription,
      longDiscription,
      tags: tags ? JSON.parse(tags) : [],
      sku: generateSKU() || "PRE-000000",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
    await product.save();
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});
