const mongoose = require("mongoose");
const Lead = require("../../../models/lead");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLeadList = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    name,         // contact name search
    mobile,       // contact number search
    fromDate,
    toDate,
    server,       // server search (free text mapped to lco/reseller name)
    createdBy,    // creator name
    area,         // SubZone ObjectId
    zone,         // Zone ObjectId
    reseller,     // Retailer ObjectId
    lco,          // Lco ObjectId
    stage,        // New | Contacted | Qualified | Converted | Lost
  } = req.query;

  // ── Build match query ─────────────────────────────────────────────────────
  const match = {};

  if (name) {
    match.contactName = { $regex: name.trim(), $options: "i" };
  }
  if (mobile) {
    match.contactNumber = { $regex: mobile.trim(), $options: "i" };
  }
  if (stage) {
    match.stage = stage;
  }
  if (area) {
    match.area = new mongoose.Types.ObjectId(area);
  }
  if (zone) {
    match.zone = new mongoose.Types.ObjectId(zone);
  }
  if (reseller) {
    match.resellerId = new mongoose.Types.ObjectId(reseller);
  }
  if (lco) {
    match.lcoId = new mongoose.Types.ObjectId(lco);
  }

  // ── Date range filter ─────────────────────────────────────────────────────
  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      match.createdAt.$gte = start;
    }
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // ── Aggregation pipeline ──────────────────────────────────────────────────
  const pipeline = [
    { $match: match },
    { $sort: { createdAt: -1 } },

    // Lookup Zone
    {
      $lookup: {
        from: "zones",
        localField: "zone",
        foreignField: "_id",
        as: "zoneInfo",
      },
    },
    {
      $unwind: { path: "$zoneInfo", preserveNullAndEmptyArrays: true },
    },

    // Lookup SubZone (Area)
    {
      $lookup: {
        from: "subzones",
        localField: "area",
        foreignField: "_id",
        as: "areaInfo",
      },
    },
    {
      $unwind: { path: "$areaInfo", preserveNullAndEmptyArrays: true },
    },

    // Lookup Assigned To (Staff)
    {
      $lookup: {
        from: "staffs",
        localField: "assignToId",
        foreignField: "_id",
        as: "assignedStaffInfo",
      },
    },

    {
      $project: {
        leadNumber: 1,
        contactName: 1,
        contactNumber: 1,
        email: 1,
        company: 1,
        state: 1,
        district: 1,
        address: 1,
        category: 1,
        serviceRequired: 1,
        callSource: 1,
        severity: 1,
        description: 1,
        stage: 1,
        createdAt: 1,
        updatedAt: 1,
        zone: "$zoneInfo.name",
        area: "$areaInfo.name",
        assignedTo: "$assignedStaffInfo.name",
        assignToModel: 1,
        lcoId: 1,
        resellerId: 1,
      },
    },

    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  // ── Resolve createdBy filter separately (name-based lookup) ──────────────
  if (createdBy) {
    const regex = new RegExp(createdBy.trim(), "i");
    const [admins, resellers, lcos, staffs] = await Promise.all([
      mongoose.model("Admin").find({ name: regex }).select("_id"),
      mongoose.model("Retailer").find({ resellerName: regex }).select("_id"),
      mongoose.model("Lco").find({ lcoName: regex }).select("_id"),
      mongoose.model("Staff").find({ name: regex }).select("_id"),
    ]);
    const ids = [
      ...admins.map((a) => a._id),
      ...resellers.map((r) => r._id),
      ...lcos.map((l) => l._id),
      ...staffs.map((s) => s._id),
    ];
    match.createdById = { $in: ids };
  }

  // ── Server filter (lco/reseller name-based) ───────────────────────────────
  if (server) {
    const regex = new RegExp(server.trim(), "i");
    const [lcos] = await Promise.all([
      mongoose.model("Lco").find({ lcoName: regex }).select("_id"),
    ]);
    if (lcos.length) {
      match.lcoId = { $in: lcos.map((l) => l._id) };
    } else {
      // No match → return empty
      match.lcoId = { $in: [] };
    }
  }

  const [leads, totalCount] = await Promise.all([
    Lead.aggregate(pipeline),
    Lead.countDocuments(match),
  ]);

  return successResponse(res, "Lead list fetched successfully", {
    totalCount,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalCount / parseInt(limit)),
    leads,
  });
});
