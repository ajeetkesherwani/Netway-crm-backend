const { default: mongoose } = require("mongoose");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
// const sendEmail = require("../../../utils/sendEmail");

exports.getUserList = catchAsync(async (req, res, next) => {
  const {
    searchQuery,
    status,
    area,
    subZone,
    ekyc,
    startDate,
    endDate,
    serviceOpted,
    reseller,
    lco,
    cafUploaded,
    connectionType,
    installationBy,
    serverType,
  } = req.query;

  const query = {};
  if (searchQuery && searchQuery.trim()) {
    const safeSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      { "generalInformation.name": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.username": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.UserId": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.email": { $regex: safeSearch, $options: "i" } },
      { "generalInformation.phone": { $regex: safeSearch, $options: "i" } },
    ];
  }
  if (area) {
    query["addressDetails.area"] = new mongoose.Types.ObjectId(area);
  }

  if (subZone) {
    query["addressDetails.subZone"] = new mongoose.Types.ObjectId(subZone);
  }

  if (status) {
    query.status = status;
  }

  if (ekyc) {
    query["additionalInformation.ekyc"] = ekyc;
  }

  if (serviceOpted) {
    query["generalInformation.serviceOpted"] = serviceOpted;
  }

  if (connectionType) {
    query["generalInformation.connectionType"] = connectionType.toLowerCase();
  }

  if (serverType && serverType.trim()) {
    query["generalInformation.serverType"] = { $regex: serverType.trim(), $options: "i" };
  }

  if (installationBy) {
    const installCondition = [];
    if (mongoose.Types.ObjectId.isValid(installationBy)) {
      installCondition.push({ "generalInformation.installationBy": new mongoose.Types.ObjectId(installationBy) });
    }
    installCondition.push({ "generalInformation.installationByName": { $regex: installationBy, $options: "i" } });

    if (!query.$and) {
      query.$and = [];
    }
    query.$and.push({ $or: installCondition });
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }
  if (reseller) {
    query["generalInformation.createdFor.type"] = "Retailer";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      reseller
    );
  } else if (lco) {
    query["generalInformation.createdFor.type"] = "Lco";
    query["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(
      lco
    );
  }


  /* ---------------- CAF FORM FILTER ---------------- */
  if (cafUploaded === "yes") {
    query.document = {
      $elemMatch: {
        documentType: "Caf Form",
        documentImage: { $exists: true, $ne: [] },
      },
    };
  }

  if (cafUploaded === "no") {
    query.$or = [
      { document: { $not: { $elemMatch: { documentType: "Caf Form" } } } },
      {
        document: {
          $elemMatch: {
            documentType: "Caf Form",
            documentImage: { $size: 0 },
          },
        },
      },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  if (!users) return next(new AppError("User not found", 404));

  // Explicitly add IPACCT IDs and serverType to the root level for easy access in frontend
  const mappedUsers = users.map(user => {
    user.ipactId = user.generalInformation?.ipactId || "";
    user.ipacctCustomerId = user.generalInformation?.ipacctCustomerId || "";
    user.serverType = user.generalInformation?.serverType || null;
    return user;
  });

  successResponse(res, "User found successfully", mappedUsers);
});
