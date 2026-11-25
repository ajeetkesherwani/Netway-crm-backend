const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const Vendor = require("../../../models/vendor");
const Driver = require("../../../models/driver");
const VendorWallet = require("../../../models/vendorWalletHistory");
const DriverWalletHistory = require("../../../models/driverWalletHistory");
const logMonitoringActivity = require("../../../utils/logMonitoringActivity");


// vendor commission calculation function

const calculateVendorEarning = ({ totalAmount, commission = 0 }) => {
  const commissionAmount = (totalAmount * commission) / 100;
  const vendorEarning = totalAmount - commissionAmount;
  return {
    vendorEarning,
    commissionAmount
  };
};

//vendor wallet history function

const createVendorWalletHistory = async ({ vendorId, orderId, orderNumber, amount,
    type, reason, commission, totalAmount, status, description
    }) => {

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return next(new AppError("Vendor not found", 404));

    vendor.wallet_balance = vendor.wallet_balance || 0;
    if (type === "credit") {
        vendor.wallet_balance += amount;
    } else {
        vendor.wallet_balance -= amount;
    }

    await vendor.save();

    const vendor_wallet_history = await VendorWallet.create({
        vendorId,
        orderId,
        orderNumber,
        amount,
        type,
        reason,
        status,
        commission,
        totalAmount,
        description,
        balance_after_transaction: vendor.wallet_balance
    });

    return {
        vendor_wallet_history
    };
}


//driver wallet history function

const createDriverWallet = async ({ driverId, orderId, amount,
    type, reason, commission, totalAmount, description, 
    status }) => {

    const driver = await Driver.findById(driverId);
   if (!driver) throw new AppError("Driver not found", 404);

  driver.walletBalance = driver.walletBalance || 0;

  if (type === "credit") {
    driver.walletBalance += amount;
  } else {
    driver.walletBalance -= amount;
  }

  await driver.save();


    const driver_wallet_history = await DriverWalletHistory.create({
        driverId,
        orderId,
        amount,
        type,
        reason,
        status,
        commission,
        totalAmount,
        description,
        balance_after_transaction: driver.walletBalance
    });

    return {
        driver_wallet_history
    };
}


exports.deliveryPhotoUpload = catchAsync(async (req, res, next) => {

  const driverId = req.driver._id;
  
  const { subOrderId } = req.params;

  const subOrder = await SubOrder.findById(subOrderId);
  if (!subOrder) return next(new AppError("SubOrder not found", 404));

  if (String(subOrder.assignDeliveryBoyId) !== String(driverId)) {
    return next(new AppError("Unauthorized access", 403));
  }

  if (subOrder.status === "delivered") {
      return next(new AppError("This order is already marked as delivered", 400));
  }

  const uploadedPhotos = req.files?.deliveryPhoto?.map(file => file.path);

  if (!uploadedPhotos || uploadedPhotos.length === 0) {
    return next(new AppError("At least one photo is required", 400));
  }

  subOrder.deliveryPhoto = uploadedPhotos;

  subOrder.status = "delivered";

    await subOrder.save();

  //vendor wallet_history 

  const vendorId = subOrder.vendorId._id || subOrder.vendorId;
  const subTotal = subOrder.subTotal;
  // const orderNumber = subOrder.orderNumber || subOrder._id;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return next(new AppError("Vendor not found", 404));

  const commission = vendor.commission || 0;
  const vendorOpeningBalance = Number(vendor.wallet_balance || 0);

  const { vendorEarning, commissionAmount } = calculateVendorEarning({
    totalAmount: subTotal,
    commission
  });

  const { vendor_wallet_history } = await createVendorWalletHistory({
    vendorId,
    orderId: subOrder._id,
    amount: vendorEarning,
    commission: commissionAmount,
    type: "credit",
    reason: "order_payment",
    status: "pending",
    totalAmount: subTotal,
    balance_after_transaction: vendor.wallet_balance
  });

  await logMonitoringActivity({
    req,
    actor: {
      _id: req.driver?._id,
      name: req.driver?.name || req.driver?.driverName,
      role: "Driver",
    },
    action: "Vendor Wallet Credited",
    module: "wallet",
    description: `Delivery earnings credited to vendor for order ${subOrder._id}`,
    targetId: vendorId,
    targetName: vendor.vendorName,
    targetType: "vendor",
    details: {
      walletHistoryId: vendor_wallet_history._id,
      vendorId,
      orderId: subOrder._id,
      amount: vendorEarning,
      openingBalance: vendorOpeningBalance,
      closingBalance: vendor_wallet_history.balance_after_transaction,
      commission: commissionAmount,
      totalAmount: subTotal,
      performedById: req.driver?._id,
      performedByRole: "Driver",
    },
  });


  //driver wallet_history

  const deliveryCharge = 40;

  const driver = await Driver.findById(driverId);
  if (!driver) return next(new AppError("Driver not found", 404));

  const driverOpeningBalance = Number(driver.walletBalance || 0);
  const driverEarning = deliveryCharge;
  const updatedBalance = (driver.walletBalance || 0) + driverEarning;


  const { driver_wallet_history } = await createDriverWallet({
    driverId: subOrder.assignDeliveryBoyId,
    orderId: subOrder._id,
    commission: driverEarning,
    type: "credit",
    amount: driverEarning,
    reason: "order_payment",
    totalAmount: subTotal,
    balance_after_transaction: updatedBalance
  });

  await logMonitoringActivity({
    req,
    actor: {
      _id: req.driver?._id,
      name: req.driver?.name || req.driver?.driverName,
      role: "Driver",
    },
    action: "Driver Wallet Credited",
    module: "wallet",
    description: `Delivery earnings credited to driver for order ${subOrder._id}`,
    targetId: driverId,
    targetName: driver.name || driver.driverName,
    targetType: "driver",
    details: {
      walletHistoryId: driver_wallet_history._id,
      driverId,
      orderId: subOrder._id,
      amount: driverEarning,
      openingBalance: driverOpeningBalance,
      closingBalance: driver_wallet_history.balance_after_transaction,
      performedById: req.driver?._id,
      performedByRole: "Driver",
    },
  });

  successResponse(res, "subOrder status updated successfully", {
    orderId: subOrder._id,
    status: subOrder.status,
    deliveryPhoto: subOrder.deliveryPhoto,
    vendor_wallet_history,
    driver_wallet_history
  });
});