const Invoice = require("../../../models/invoice");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

/* ───────────── GET USER INVOICES ───────────── */
exports.getUserInvoice = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // 1️⃣ Get invoices + populate user
  let invoices = await Invoice.find({ userId })
    .populate({
      path: "userId",
      select:
        "generalInformation.name generalInformation.email generalInformation.phone",
    })
    .sort({ createdAt: -1 })
    .lean();

  // 2️⃣ Populate addedBy name manually
  invoices = await Promise.all(
    invoices.map(async (invoice) => {
      let addedBy = null;

      if (invoice.addedByType === "Admin") {
        const admin = await Admin.findById(invoice.addedById)
          .select("name")
          .lean();
        addedBy = admin?.name;
      }

      if (invoice.addedByType === "Reseller") {
        const reseller = await Retailer.findById(invoice.addedById)
          .select("resellerName")
          .lean();
        addedBy = reseller?.resellerName;
      }

      if (invoice.addedByType === "Lco") {
        const lco = await Lco.findById(invoice.addedById)
          .select("lcoName")
          .lean();
        addedBy = lco?.lcoName;
      }

      return {
        ...invoice,
        addedBy,
      };
    })
  );

  successResponse(res, "User invoices fetched successfully", {
    totalCount: invoices.length,
    invoices,
  });
});
