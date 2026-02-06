const Invoice = require("../../../models/invoice");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Package = require("../../../models/package"); // ← important – add this
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

/* ───────────── GET USER INVOICES (for user-specific invoice list) ───────────── */
exports.getUserInvoice = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // 1. Fetch invoices for this user + populate user & package
  let invoices = await Invoice.find({ userId })
    .populate({
      path: "userId",
      select:
        "generalInformation.name generalInformation.email generalInformation.phone generalInformation.createdFor generalInformation.username",
    })
    .populate({
      path: "package",
      select: "name validity isOtt isIptv internet", // ← get real package data
    })
    .sort({ createdAt: -1 })
    .lean();

  // 2. Enrich each invoice with missing frontend-expected fields
  invoices = await Promise.all(
    invoices.map(async (invoice) => {
      // ── Added By name ───────────────────────────────────────
      let addedBy = null;
      if (invoice.addedByType === "Admin") {
        const admin = await Admin.findById(invoice.addedById)
          .select("name")
          .lean();
        addedBy = admin?.name || "Admin";
      } else if (invoice.addedByType === "Reseller") {
        const reseller = await Retailer.findById(invoice.addedById)
          .select("resellerName")
          .lean();
        addedBy = reseller?.resellerName || "Reseller";
      } else if (invoice.addedByType === "Lco") {
        const lco = await Lco.findById(invoice.addedById)
          .select("lcoName")
          .lean();
        addedBy = lco?.lcoName || "LCO";
      }

      // ── Created For name (who the user was created for) ─────
      let createdFor = null;
      const createdForObj = invoice.userId?.generalInformation?.createdFor;

      if (createdForObj?.id) {
        if (["Retailer", "Reseller"].includes(createdForObj.type)) {
          const retailer = await Retailer.findById(createdForObj.id)
            .select("resellerName")
            .lean();
          createdFor = retailer?.resellerName || null;
        } else if (createdForObj.type === "Lco") {
          const lco = await Lco.findById(createdForObj.id)
            .select("lcoName")
            .lean();
          createdFor = lco?.lcoName || null;
        }
      }

      // ── Package name & type (from populated package) ────────
      const pkg = invoice.package;
      const packageName = pkg?.name || invoice.packageName || "—";

      const packageType = {
        isOtt: !!pkg?.isOtt,
        isIptv: !!pkg?.isIptv,
        internet: !!pkg?.internet || (!pkg?.isOtt && !pkg?.isIptv),
      };

      // ── Duration (start = invoice date, end = calculated) ───
      const startDate = invoice.createdAt;
      let endDate = null;

      if (pkg?.validity?.number && pkg?.validity?.unit) {
        endDate = new Date(startDate);
        const num = Number(pkg.validity.number);

        switch (pkg.validity.unit.toLowerCase()) {
          case "day":
          case "days":
            endDate.setDate(endDate.getDate() + num);
            break;
          case "month":
          case "months":
            endDate.setMonth(endDate.getMonth() + num);
            break;
          case "year":
          case "years":
            endDate.setFullYear(endDate.getFullYear() + num);
            break;
          default:
            endDate = null;
        }
      }

      return {
        ...invoice,
        packageName,                    // now filled
        packageType,                    // now correct
        duration: {                     // frontend expects this
          startDate,
          endDate,
        },
        addedBy,                        // name instead of ID
        createdFor,                     // name of reseller/lco who created user
      };
    })
  );

  successResponse(res, "User invoices fetched successfully", {
    totalCount: invoices.length,
    invoices,
  });
});
