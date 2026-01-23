// const Invoice = require("../../../models/invoice");
// const User = require("../../../models/user");
// const Admin = require("../../../models/admin");
// const Retailer = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");
// const mongoose = require("mongoose");

// /* ───────────── DATE PARSER (dd/mm/yyyy → UTC) ───────────── */
// const parseDDMMYYYY = (dateStr, isEnd = false) => {
//   if (!dateStr) return null;

//   const [dd, mm, yyyy] = dateStr.split("/").map(Number);
//   if (!dd || !mm || !yyyy) return null;

//   return isEnd
//     ? new Date(Date.UTC(yyyy, mm - 1, dd, 23, 59, 59, 999))
//     : new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0));
// };

// /* ───────────── GET INVOICE LIST ───────────── */
// exports.getInvoiceList = catchAsync(async (req, res) => {
//   const {
//     page = 1,
//     limit = 15,
//     type,
//     userSearch,
//     fromDate,
//     toDate,
//     areaId,
//     resellerId,
//     lcoId,
//     packageId,
//     status,
//     createdBy,
//   } = req.query;

//   const filter = {};
//   let userFilter = {};

//   /* ───────────── PACKAGE TYPE ───────────── */
//   if (type === "ott") filter["packageType.isOtt"] = true;
//   if (type === "iptv") filter["packageType.isIptv"] = true;
//   if (type === "internet") filter["packageType.internet"] = true;

//   /* ───────────── DATE FILTER (FROM / TO / BOTH) ───────────── */
//   if (fromDate || toDate) {
//     const startDate = fromDate
//       ? parseDDMMYYYY(fromDate)
//       : parseDDMMYYYY(toDate);

//     const endDate = fromDate
//       ? parseDDMMYYYY(fromDate, true)
//       : parseDDMMYYYY(toDate, true);

//     if (fromDate && toDate) {
//       startDate = parseDDMMYYYY(fromDate);
//       endDate = parseDDMMYYYY(toDate, true);
//     }

//     filter.createdAt = {
//       $gte: startDate,
//       $lte: endDate,
//     };
//   }

//   /* ───────────── USER BASED FILTERS ───────────── */
//   if (areaId) {
//     userFilter["addressDetails.area"] = areaId;
//   }

//   if (resellerId) {
//     userFilter["generalInformation.createdFor.type"] = "Reseller";
//     userFilter["generalInformation.createdFor.id"] = resellerId;
//   }

//   if (lcoId) {
//     userFilter["generalInformation.createdFor.type"] = "Lco";
//     userFilter["generalInformation.createdFor.id"] = lcoId;
//   }

//   if (Object.keys(userFilter).length > 0) {
//     const users = await User.find(userFilter, { _id: 1 }).lean();
//     const userIds = users.map(u => u._id);

//     if (!userIds.length) {
//       return successResponse(res, "Invoice list fetched successfully", {
//         totalCount: 0,
//         invoices: [],
//         page: Number(page),
//         pages: 0,
//         limit: Number(limit),
//       });
//     }

//     filter.userId = { $in: userIds };
//   }

//   /* ───────────── OTHER FILTERS ───────────── */
//   if (packageId) {
//     filter.package = new mongoose.Types.ObjectId(packageId);
//   }
//   if (status) filter.status = status;
//   if (createdBy) filter.addedByType = createdBy;

//   /* ───────────── PAGINATION ───────────── */
//   const skip = (page - 1) * limit;

//   /* ───────────── MAIN QUERY ───────────── */
//   let invoices = await Invoice.find(filter)
//     .populate({
//       path: "userId",
//       select:
//         "generalInformation.name generalInformation.username generalInformation.email generalInformation.phone generalInformation.createdFor addressDetails.area",
//       populate: {
//         path: "addressDetails.area",
//         select: "zoneName",
//       },
//     })
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(Number(limit))
//     .lean();

//   /* ───────────── USER SEARCH ───────────── */
//   if (userSearch) {
//     const regex = new RegExp(userSearch, "i");
//     invoices = invoices.filter(inv =>
//       regex.test(inv.userId?.generalInformation?.name) ||
//       regex.test(inv.userId?.generalInformation?.email) ||
//       regex.test(inv.userId?.generalInformation?.phone)
//     );
//   }

//   /* ───────────── POPULATE createdFor NAME (ADDED) ───────────── */
//   invoices = await Promise.all(
//     invoices.map(async (invoice) => {
//       const createdFor = invoice.userId?.generalInformation?.createdFor;
//       let createdForName = null;

//       if (createdFor?.type === "Reseller") {
//         const reseller = await Retailer.findById(createdFor.id)
//           .select("resellerName")
//           .lean();
//         createdForName = reseller?.resellerName;
//       }

//       if (createdFor?.type === "Lco") {
//         const lco = await Lco.findById(createdFor.id)
//           .select("lcoName")
//           .lean();
//         createdForName = lco?.lcoName;
//       }

//       return {
//         ...invoice,
//         userId: {
//           ...invoice.userId,
//           generalInformation: {
//             ...invoice.userId.generalInformation,
//             createdForName, // ✅ FINAL OUTPUT
//           },
//         },
//       };
//     })
//   );

//   const totalCount = invoices.length;

//   /* ───────────── POPULATE addedBy ───────────── */
//   const populatedInvoices = await Promise.all(
//     invoices.map(async (invoice) => {
//       let addedBy = null;

//       if (invoice.addedByType === "Admin") {
//         const admin = await Admin.findById(invoice.addedById)
//           .select("name")
//           .lean();
//         addedBy = admin?.name;
//       } else if (invoice.addedByType === "Reseller") {
//         const reseller = await Retailer.findById(invoice.addedById)
//           .select("resellerName")
//           .lean();
//         addedBy = reseller?.resellerName;
//       } else if (invoice.addedByType === "Lco") {
//         const lco = await Lco.findById(invoice.addedById)
//           .select("lcoName")
//           .lean();
//         addedBy = lco?.lcoName;
//       }

//       return { ...invoice, addedBy };
//     })
//   );

//   /* ───────────── RESPONSE ───────────── */
//   successResponse(res, "Invoice list fetched successfully", {
//     totalCount,
//     invoices: populatedInvoices,
//     page: Number(page),
//     pages: Math.ceil(totalCount / limit),
//     limit: Number(limit),
//   });
// });


const Invoice = require("../../../models/invoice");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Package = require("../../../models/package"); // ← Make sure you import your Package model
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const mongoose = require("mongoose");

/* ───────────── DATE PARSER (dd/mm/yyyy → UTC) ───────────── */
const parseDDMMYYYY = (dateStr, isEnd = false) => {
  if (!dateStr) return null;
  const [dd, mm, yyyy] = dateStr.split("/").map(Number);
  if (!dd || !mm || !yyyy || isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;

  if (isEnd) {
    return new Date(Date.UTC(yyyy, mm - 1, dd, 23, 59, 59, 999));
  }
  return new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0, 0));
};

/* ───────────── CALCULATE DURATION END DATE ───────────── */
const calculateEndDate = (startDate, validity) => {
  if (!startDate || !validity?.number || !validity?.unit) return null;

  const end = new Date(startDate);
  const num = Number(validity.number);

  switch (validity.unit.toLowerCase()) {
    case "day":
    case "days":
      end.setDate(end.getDate() + num);
      break;
    case "month":
    case "months":
      end.setMonth(end.getMonth() + num);
      break;
    case "year":
    case "years":
      end.setFullYear(end.getFullYear() + num);
      break;
    default:
      return null;
  }
  return end;
};

/* ───────────── GET INVOICE LIST ───────────── */
exports.getInvoiceList = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 15,
    userSearch,
    fromDate,
    toDate,
    areaId,
    resellerId,
    lcoId,
    packageId,
    status,
    createdBy,
  } = req.query;

  const filter = {};
  let userFilter = {};

  // ── Date range filter ───────────────────────────────────────
  if (fromDate || toDate) {
    const start = fromDate ? parseDDMMYYYY(fromDate) : null;
    const end = toDate ? parseDDMMYYYY(toDate, true) : null;

    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = start;
      if (end) filter.createdAt.$lte = end;
    }
  }

  // ── User-based filters (area, reseller, lco) ────────────────
  if (areaId || resellerId || lcoId) {
    if (areaId) userFilter["addressDetails.area"] = areaId;
    if (resellerId) {
      userFilter["generalInformation.createdFor.type"] = "Reseller";
      userFilter["generalInformation.createdFor.id"] = resellerId;
    }
    if (lcoId) {
      userFilter["generalInformation.createdFor.type"] = "Lco";
      userFilter["generalInformation.createdFor.id"] = lcoId;
    }

    const users = await User.find(userFilter, { _id: 1 }).lean();
    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) {
      return successResponse(res, "Invoice list fetched successfully", {
        totalCount: 0,
        invoices: [],
        page: Number(page),
        pages: 0,
        limit: Number(limit),
      });
    }

    filter.userId = { $in: userIds };
  }

  // ── Other filters ───────────────────────────────────────────
  if (packageId) filter.package = new mongoose.Types.ObjectId(packageId);
  if (status) filter.paymentStatus = status; // note: your DB has paymentStatus, not status
  if (createdBy) filter.addedByType = createdBy;

  // ── Pagination ──────────────────────────────────────────────
  const skip = (Number(page) - 1) * Number(limit);

  // ── Main query with essential population ────────────────────
  let invoices = await Invoice.find(filter)
    .populate({
      path: "userId",
      select: "generalInformation.name generalInformation.username generalInformation.createdFor addressDetails.area",
      populate: {
        path: "addressDetails.area",
        select: "zoneName",
      },
    })
    .populate({
      path: "package",
      select: "name validity isOtt isIptv internet ottType iptvType", // add what you need
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // ── Client-side user search (if not handled in DB) ──────────
  if (userSearch?.trim()) {
    const regex = new RegExp(userSearch.trim(), "i");
    invoices = invoices.filter(
      (inv) =>
        regex.test(inv.userId?.generalInformation?.name) ||
        regex.test(inv.userId?.generalInformation?.username) ||
        regex.test(inv.userId?.generalInformation?.email) ||
        regex.test(inv.userId?.generalInformation?.phone)
    );
  }

  // ── Enrich each invoice (packageName, packageType, duration, addedBy, createdForName) ──
  const enrichedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      // 1. Package info
      let packageName = invoice.package?.name || "—";
      let packageType = {
        isOtt: !!invoice.package?.isOtt,
        isIptv: !!invoice.package?.isIptv,
        internet: !invoice.package?.isOtt && !invoice.package?.isIptv, // fallback
      };

      // 2. Duration
      const startDate = invoice.createdAt;
      const endDate = calculateEndDate(startDate, invoice.package?.validity);

      // 3. Added By name
      let addedBy = "—";
      if (invoice.addedById) {
        if (invoice.addedByType === "Admin") {
          const admin = await Admin.findById(invoice.addedById).select("name").lean();
          addedBy = admin?.name || "Admin";
        } else if (invoice.addedByType === "Reseller") {
          const reseller = await Retailer.findById(invoice.addedById).select("resellerName").lean();
          addedBy = reseller?.resellerName || "Reseller";
        } else if (invoice.addedByType === "Lco") {
          const lco = await Lco.findById(invoice.addedById).select("lcoName").lean();
          addedBy = lco?.lcoName || "LCO";
        }
      }

      // 4. CreatedFor (Reseller or LCO name under user)
      let createdForName = null;
      const createdFor = invoice.userId?.generalInformation?.createdFor;
      if (createdFor?.id) {
        if (createdFor.type === "Reseller") {
          const res = await Retailer.findById(createdFor.id).select("resellerName").lean();
          createdForName = res?.resellerName;
        } else if (createdFor.type === "Lco") {
          const lco = await Lco.findById(createdFor.id).select("lcoName").lean();
          createdForName = lco?.lcoName;
        }
      }

      return {
        ...invoice,
        packageName,                    // ← now filled
        packageType,                    // ← now correct
        duration: {                     // ← new key your frontend uses
          startDate,
          endDate,
        },
        addedBy,                        // ← now populated name
        userId: {
          ...invoice.userId,
          generalInformation: {
            ...invoice.userId?.generalInformation,
            createdForName,             // ← Reseller / LCO name
          },
        },
      };
    })
  );

  const totalCount = await Invoice.countDocuments(filter);

  successResponse(res, "Invoice list fetched successfully", {
    totalCount,
    invoices: enrichedInvoices,
    page: Number(page),
    pages: Math.ceil(totalCount / limit),
    limit: Number(limit),
  });
});