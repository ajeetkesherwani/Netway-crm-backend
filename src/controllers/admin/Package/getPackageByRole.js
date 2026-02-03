const Package = require("../../../models/package");
const AssignedPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPackagesByRole = catchAsync(async (req, res, next) => {
  const creator = req.user;
  let { targetRole, targetId } = req.query;

  // default → logged-in user
  if (!targetRole || targetRole === "undefined" || targetRole.trim() === "") {
    targetRole = creator.role; // Admin / Reseller / Lco
    targetId = creator._id;
  }

  let finalPackages = [];

  // ─────────────────────────────
  // ADMIN
  // ─────────────────────────────
  if (creator.role === "Admin") {

    // Admin → Self
    if (targetRole === "Admin" || targetRole === "Self") {
      const packages = await Package.find({ status: "active" }).sort({ createdAt: -1 });

      finalPackages = packages.map(p => ({
        _id: p._id,
        name: p.name,
        basePrice: p.basePrice || 0,
        price: p.offerPrice || p.basePrice || 0,
        offerPrice: p.offerPrice || 0,
        status: p.status
      }));

      return successResponse(res, "Packages fetched", { packages: finalPackages });
    }

    // Admin → Reseller
    if (targetRole === "Reseller") {
      if (!targetId) return next(new AppError("targetId is required for Reseller", 400));

      const assigned = await AssignedPackage.find({
        assignTo: "Reseller",
        assignToId: targetId
      });

      finalPackages = assigned.flatMap(ap =>
        (ap.packages || []).map(p => ({
          _id: p.packageId,
          name: p.name,
          basePrice: p.basePrice || 0,
          price: p.price || p.basePrice || 0,
          offerPrice: p.offerPrice || 0,
          status: p.status
        }))
      );

      return successResponse(res, "Packages fetched", { packages: finalPackages });
    }

    // Admin → LCO
    if (targetRole === "Lco") {
      if (!targetId) return next(new AppError("targetId is required for LCO", 400));

      const assigned = await AssignedPackage.find({
        assignTo: "Lco",
        assignToId: targetId
      });

      finalPackages = assigned.flatMap(ap =>
        (ap.packages || []).map(p => ({
          _id: p.packageId,
          name: p.name,
          basePrice: p.basePrice || 0,
          price: p.price || p.basePrice || 0,
          offerPrice: p.offerPrice || 0,
          status: p.status
        }))
      );

      return successResponse(res, "Packages fetched", { packages: finalPackages });
    }
  }

  // ─────────────────────────────
  // RESELLER → LCO
  // ─────────────────────────────
  if (creator.role === "Reseller" && targetRole === "Lco") {
    if (!targetId) return next(new AppError("targetId is required for LCO", 400));

    const assigned = await AssignedPackage.find({
      assignTo: "Lco",
      assignToId: targetId
    });

    finalPackages = assigned.flatMap(ap =>
      (ap.packages || []).map(p => ({
        _id: p.packageId,
        name: p.name,
        basePrice: p.basePrice || 0,
        price: p.price || p.basePrice || 0,
        offerPrice: p.offerPrice || 0,
        status: p.status
      }))
    );

    return successResponse(res, "Packages fetched", { packages: finalPackages });
  }

  // ─────────────────────────────
  // LCO → SELF
  // ─────────────────────────────
  if (creator.role === "Lco" && targetRole === "Self") {
    const assigned = await AssignedPackage.find({
      assignTo: "Lco",
      assignToId: creator._id
    });

    finalPackages = assigned.flatMap(ap =>
      (ap.packages || []).map(p => ({
        _id: p.packageId,
        name: p.name,
        basePrice: p.basePrice || 0,
        price: p.price || p.basePrice || 0,
        offerPrice: p.offerPrice || 0,
        status: p.status
      }))
    );

    return successResponse(res, "Packages fetched", { packages: finalPackages });
  }

  return next(new AppError("Not allowed to fetch packages for this role", 403));
});
