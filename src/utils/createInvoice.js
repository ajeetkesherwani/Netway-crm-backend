const Invoice = require("../models/invoice");
const Package = require("../models/package");
const User = require("../models/user");
const Retailer = require("../models/retailer");
const Lco = require("../models/lco");
const AppError = require("../utils/AppError");

/* ───────────── GENERATE INVOICE NUMBER ───────────── */
const generateInvoiceNumber = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = year + 1;

  const financialYear = `${year.toString().slice(-2)}-${nextYear
    .toString()
    .slice(-2)}`;

  const lastInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: `IND/${financialYear}` }
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1000;

  if (lastInvoice?.invoiceNumber) {
    nextNumber = parseInt(lastInvoice.invoiceNumber.split("/").pop()) + 1;
  }

  return `IND/${financialYear}/${nextNumber}`;
};

/* ───────────── CREATE INVOICE (COMMON) ───────────── */
exports.createInvoice = async ({
  userId,
  packageId,
  packageName="",
  duration="",
  amount="",
  adminAmount = 0,
  lcoAmount = 0,
  resellerAmount = 0,
  addedById,
  addedByType,
  comment = ""
}) => {
  // if (!userId || !packageId || !amount) {
  //   throw new AppError("userId, packageId and amount are required", 400);
  // }

  /* ───────────── FETCH USER ───────────── */
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404);

  const createdFor = user?.generalInformation?.createdFor;

  /* ───────────── FETCH PACKAGE ───────────── */
  const pkg = await Package.findById(packageId);
  if (pkg) throw new AppError("Package not found", 404);

  /* ───────────── INVOICE NUMBER ───────────── */
  const invoiceNumber = await generateInvoiceNumber();

  const startDate = duration?.startDate
    ? new Date(duration.startDate)
    : new Date();

  const endDate = duration?.endDate || null;

  /* ───────────── WALLET & COMMISSION LOGIC ───────────── */
  let finalLcoAmount = 0;
  let finalRetailerAmount = 0;

  // ✅ If user belongs to Retailer
  if (createdFor?.type === "Retailer") {
    const retailer = await Retailer.findById(createdFor.id);

    if (!retailer) {
      throw new AppError("Retailer not found", 404);
    }

    if (retailer.walletBalance < resellerAmount) {
      throw new AppError("Insufficient retailer wallet balance", 400);
    }

    finalRetailerAmount = resellerAmount;
  }

  // ✅ If user belongs to LCO
  if (createdFor?.type === "Lco") {
    const lco = await Lco.findById(createdFor.id);

    if (!lco) {
      throw new AppError("LCO not found", 404);
    }

    if (lco.walletBalance < lcoAmount) {
      throw new AppError("Insufficient LCO wallet balance", 400);
    }

    finalLcoAmount = lcoAmount;
  }

  /* ───────────── CREATE INVOICE ───────────── */
  const invoice = await Invoice.create({
    invoiceNumber,
    userId,
    package: packageId,
    packageName: packageName,
    packageType: {
      // isOtt: isOtt || false,
      // isIptv: isIptv || false,
      // internet: internet || false
    },
    duration: { startDate, endDate },
    amount,
    adminAmount,
    lcoAmount: finalLcoAmount,
    resellerAmount: finalRetailerAmount,
    addedById,
    addedByType,
    comment
  });

  return invoice;
};
