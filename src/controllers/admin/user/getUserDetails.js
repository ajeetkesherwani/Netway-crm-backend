const mongoose = require("mongoose");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserDetails = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid user id", 400));
  }

  const user = await User.findById(id)
    .populate({
      path: "generalInformation.installationBy",
      model: "Staff",
      select: "name phone email",
    })
    .populate({
      path: "addressDetails.area",
      model: "Zone",
      select: "zoneName",
    })
    .populate({
      path: "addressDetails.subZone",
      model: "SubZone",
      select: "name",
    })
    .lean();

  if (!user) return next(new AppError("User not found", 404));

  /* =====================================================
     CREATED BY (ADMIN / RESELLER / LCO)
  ===================================================== */
  const createdBy = user.generalInformation?.createdBy;

  if (createdBy?.type === "Admin" && createdBy?.id) {
    const admin = await Admin.findById(createdBy.id).select(
      "name"
    );
    user.generalInformation.createdBy.details = admin || null;
  }

  if (createdBy?.type === "Reseller" && createdBy?.id) {
    const reseller = await Reseller.findById(createdBy.id).select(
      "resellerName"
    );
    user.generalInformation.createdBy.details = reseller || null;
  }

  if (createdBy?.type === "Lco" && createdBy?.id) {
    const lco = await Lco.findById(createdBy.id).select(
      "lcoName"
    );
    user.generalInformation.createdBy.details = lco || null;
  }

  /* =====================================================
     CREATED FOR (SELF / ADMIN / RESELLER / LCO)
  ===================================================== */
  const createdFor = user.generalInformation?.createdFor;

  // Self behaves like Admin
  if (
    (createdFor?.type === "Self" || createdFor?.type === "Admin") &&
    createdFor?.id
  ) {
    const admin = await Admin.findById(createdFor.id).select(
      "name"
    );
    user.generalInformation.createdFor.details = admin || null;
  }

  if (createdFor?.type === "Reseller" && createdFor?.id) {
    const reseller = await Reseller.findById(createdFor.id).select(
      "resellerName"
    );
    user.generalInformation.createdFor.details = reseller || null;
  }

  if (createdFor?.type === "Lco" && createdFor?.id) {
    const lco = await Lco.findById(createdFor.id).select(
      "lcoName"
    );
    user.generalInformation.createdFor.details = lco || null;
  }

  return successResponse(res, "User details found successfully", {
    user
  });
};
