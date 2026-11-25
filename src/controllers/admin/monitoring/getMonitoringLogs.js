const MonitoringLog = require("../../../models/monitoringLog");
const Logs = require("../../../models/activity");
const smsTemplates = require("../../../utils/smsTemplate");
const whatsappTemplates = require("../../../utils/whatsappTemplates");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const validFilters = ["activity", "audit", "sms", "whatsapp"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMonitoringLogs = catchAsync(async (req, res, next) => {
  const accountType = String(req.user?.accountType || "").toLowerCase();
  if (accountType !== "admin" && req.user?.role !== "Admin") {
    return next(new AppError("Only admin accounts can access monitoring logs.", 403));
  }

  const filter = String(req.query.filter || req.query.type || "").toLowerCase();
  if (!validFilters.includes(filter)) {
    return next(
      new AppError(
        "filter is required and must be activity, audit, sms, or whatsapp.",
        400,
      ),
    );
  }

  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 25;
  if (page < 1 || limit < 1 || limit > 100) {
    return next(new AppError("page must be positive and limit must be 1-100.", 400));
  }

  const query = filter === "audit" ? { action: "LOGIN" } : { type: filter };
  if (filter === "activity") {
    query.$and = [
      {
        path: {
          $not: /\/api\/admin\/auth\/(?:login|verify-otp)(?:\/|$)/i,
        },
      },
    ];
  }
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  if (
    (from && Number.isNaN(from.getTime())) ||
    (to && Number.isNaN(to.getTime())) ||
    (from && to && from > to)
  ) {
    return next(new AppError("Invalid date range.", 400));
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = from;
    if (to) query.createdAt.$lte = to;
  }

  if (filter === "audit") {
    if (req.query.actorId) query.actorId = String(req.query.actorId);
    if (req.query.role) {
      query.createdByRole = new RegExp(
        `^${escapeRegex(String(req.query.role))}$`,
        "i",
      );
    }
    if (req.query.actorRole) query.actorRole = String(req.query.actorRole);
    if (req.query.status) query.status = String(req.query.status).toUpperCase();
  } else {
    if (req.query.actorId) query.actorId = String(req.query.actorId);
    if (req.query.role) query.actorRole = String(req.query.role);
    if (req.query.action) query.action = String(req.query.action);
    if (req.query.status) query.status = String(req.query.status).toUpperCase();
    if (req.query.module) query.module = String(req.query.module);
    if (req.query.recipient && ["sms", "whatsapp"].includes(filter)) {
      query.recipient = {
        $regex: escapeRegex(String(req.query.recipient)),
        $options: "i",
      };
    }
  }

  if (req.query.search) {
    const search = new RegExp(escapeRegex(String(req.query.search)), "i");
    if (filter === "audit") {
      query.$or = [
        { actorName: search },
        { actorRole: search },
        { description: search },
        { ip: search },
      ];
    } else {
      query.$or = [
        { actorName: search },
        { actorRole: search },
        { action: search },
        { description: search },
        { path: search },
        { recipient: search },
        { templateName: search },
      ];
    }
  }

  let total;
  let records;
  if (filter === "activity") {
    const [result] = await MonitoringLog.aggregate([
      { $match: query },
      {
        $lookup: {
          from: MonitoringLog.collection.name,
          let: { requestId: "$requestId" },
          pipeline: [
            {
              $match: {
                type: "activity",
                action: { $not: /^(POST|PUT|PATCH|DELETE) / },
                $expr: {
                  $and: [
                    { $ne: ["$$requestId", null] },
                    { $eq: ["$requestId", "$$requestId"] },
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: "businessActivity",
        },
      },
      {
        $match: {
          $or: [
            { action: { $not: /^(POST|PUT|PATCH|DELETE) / } },
            { businessActivity: { $size: 0 } },
          ],
        },
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { businessActivity: 0 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);
    records = result?.data || [];
    total = result?.total?.[0]?.count || 0;
  } else {
    const LogModel = filter === "audit" ? Logs : MonitoringLog;
    const recordsQuery = LogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (filter === "audit") {
      recordsQuery.populate({
        path: "createdById",
        select: "name title staffName resellerName lcoName adminName email",
      });
    }

    [total, records] = await Promise.all([
      LogModel.countDocuments(query),
      recordsQuery.lean(),
    ]);
  }

  const data = records.map((record) => {
    const safeRecord = { ...record };
    if (
      filter === "sms" &&
      (!safeRecord.message ||
        safeRecord.message === "[REDACTED AUTHENTICATION MESSAGE]")
    ) {
      const template = smsTemplates[safeRecord.templateName];
      if (template?.content) {
        safeRecord.message = template.content.replace(/\{[^{}]+\}/g, "[REDACTED]");
      }
    } else if (
      filter === "whatsapp" &&
      (!safeRecord.message ||
        safeRecord.message === "[REDACTED AUTHENTICATION MESSAGE]")
    ) {
      const template = whatsappTemplates[safeRecord.templateName];
      if (template?.content) {
        safeRecord.message = template.content.replace(/{{\d+}}/g, "[REDACTED]");
      }
    }

    return safeRecord;
  });

  // const data = records.map((record) => {
  //   if (!record.recipient) return record;
  //   const digits = record.recipient.replace(/\D/g, "");
  //   return {
  //     ...record,
  //     recipientMasked:
  //       digits.length > 4
  //         ? `${"*".repeat(Math.min(digits.length - 4, 8))}${digits.slice(-4)}`
  //         : record.recipient,
  //     recipient: undefined,
  //   };
  // });

  return res.status(200).json({
    status: "success",
    filter,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

module.exports = { getMonitoringLogs };
