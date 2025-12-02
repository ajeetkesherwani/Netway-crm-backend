const OrderReturn = require("../../../models/orderReturn");
const MainOrder = require("../../../models/mainOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const validateRequiredField = (field, fieldName) => {
  if (!field) return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.createOrderReturnRequest = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  console.log(req.body);
  const {
    orderId,
    returnReason,
    returnMessage,
    is_refundToSourceAccount,
    refundNewAccount,
    products, // List of products to return (productId, quantity, reason, etc.)
  } = req.body;
  console.log("Parsed refundNewAccount: ", refundNewAccount); // Log parsed refundNewAccount

  // Validate required fields for the order return
  const requiredFields = [
    { field: orderId, name: "Order Id" },
    { field: returnReason, name: "Return Reason" },
    { field: returnMessage, name: "Return Message" },
    { field: is_refundToSourceAccount, name: "Is Refund To Source Account" },
    { field: products, name: "Products to Return" },
  ];

  for (const { field, name } of requiredFields) {
    const error = validateRequiredField(field, name);
    if (error) return next(error);
  }

  // If no refund source, refundNewAccount must be provided
  if (!is_refundToSourceAccount && !refundNewAccount) {
    return next(
      new AppError(
        "Refund account details are required if not refunding to the source account",
        400
      )
    );
  }

  // Validate that products are in the correct format
  const validatedProducts = [];
  for (let product of products) {
    const { productId, quantity, reason, subOrderId, images } = product;

    // Validate each product's necessary fields
    if (!productId || !quantity || !reason || !subOrderId) {
      return next(new AppError("All product return fields are required", 400));
    }

    validatedProducts.push({
      productId,
      quantity,
      reason,
      subOrderId,
      vendorId: product.vendorId,
      // images: productImages, // Attach product images
    });
  }

  // Handle file uploads for the return request (whole order-level)
  let uploadFiles = [];
  if (req.files && req.files.uploadFiles) {
    uploadFiles = req.files.uploadFiles.map(
      (file) => `${file.destination}/${file.filename}`
    );
  }

  console.log("refundNewAccount.bankName", refundNewAccount.bankName);
  const refundAccountObj = is_refundToSourceAccount
    ? undefined
    : new OrderReturn.schema.obj.refundNewAccount({
        bankName: refundNewAccount.bankName,
        branchName: refundNewAccount.branchName,
        ifscCode: refundNewAccount.ifscCode,
        accountNo: refundNewAccount.accountNo,
        holderName: refundNewAccount.holderName,
      });

  // Create return request object
  const returnRequest = new OrderReturn({
    mainOrderId: orderId,
    userId,
    returnReason,
    returnMessage,
    uploadFiles,
    is_refundToSourceAccount,
    refundNewAccount: refundAccountObj, // Manually assign refundNewAccount
    products: validatedProducts, // Array of products to return with images
  });

  // Save return request
  await returnRequest.save();

  // Send success response
  res.status(201).json({
    success: true,
    message: "Return request created successfully",
    data: returnRequest,
  });
});
