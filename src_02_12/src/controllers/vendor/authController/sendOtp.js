const Vendor = require("../../../models_old/vendor");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

function generateShopId(shopName) {
  const shopPrefix = shopName.slice(0, 5).toUpperCase().padEnd(5, "A");
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const shopId = `${shopPrefix}${randomDigits}`;

  return shopId;
}

exports.sendOtp = catchAsync(async (req, res, next) => {
  console.log(req.body);
  let { mobile } = req.body;
  if (!mobile) return next(new AppError("mobile field are required.", 400));

  const otp = "1234"; // You can replace with random OTP logic
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  let vendor = await Vendor.findOne({ mobile });
  shopId = generateShopId("PreNewShop");
  if (vendor) {
    vendor.otp = otp;
    vendor.otpExpires = otpExpires;
    await vendor.save();
  } else {
    vendor = await Vendor.create({
      mobile,
      shopId,
      otp,
      otpExpires,
    });
  }

  // await sendSms(vendor.mobile, `Your OTP is ${otp}`);
  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
    otp: process.env.NODE_ENV === "development" ? otp : "1234", // Only send OTP in dev mode
  });
});
