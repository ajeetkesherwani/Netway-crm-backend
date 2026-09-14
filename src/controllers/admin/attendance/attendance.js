const Attendance = require("../../../models/attendance");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

// --- STAFF ACTIONS --- //

// Check In
exports.checkIn = catchAsync(async (req, res, next) => {
  const staffId = req.user._id;
  const { lat, long } = req.body;
  
  if (req.user.role !== "Staff") {
    return next(new AppError("Only staff can check in", 403));
  }

  // Get current date normalized to midnight
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const today = new Date(dateStr);

  let attendance = await Attendance.findOne({ staffId, date: today });
  if (attendance && attendance.checkInTime) {
    return next(new AppError("Already checked in for today", 400));
  }

  if (!attendance) {
    attendance = new Attendance({ staffId, date: today });
  }

  attendance.checkInTime = now;
  attendance.status = "Present";
  if (lat && long) {
    attendance.checkInLocation = { lat, long };
  }
  
  await attendance.save();

  res.status(200).json({
    status: "success",
    message: "Checked in successfully",
    data: attendance,
  });
});

// Check Out
exports.checkOut = catchAsync(async (req, res, next) => {
  const staffId = req.user._id;
  const { lat, long } = req.body;

  if (req.user.role !== "Staff") {
    return next(new AppError("Only staff can check out", 403));
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const today = new Date(dateStr);

  let attendance = await Attendance.findOne({ staffId, date: today });
  if (!attendance || !attendance.checkInTime) {
    return next(new AppError("Cannot check out without checking in first", 400));
  }

  attendance.checkOutTime = now;
  
  if (lat && long) {
    attendance.checkOutLocation = { lat, long };
  }

  // Calculate total hours
  const diffMs = attendance.checkOutTime - attendance.checkInTime;
  const diffHrs = diffMs / (1000 * 60 * 60);
  attendance.totalHours = parseFloat(diffHrs.toFixed(2));

  // Determine Half Day logic (e.g. less than 4 hours)
  if (attendance.totalHours < 4) {
    attendance.status = "Half Day";
  }

  await attendance.save();

  res.status(200).json({
    status: "success",
    message: "Checked out successfully",
    data: attendance,
  });
});

// --- ADMIN ACTIONS --- //

// Get Monthly Report (Fills missing days with Absent)
exports.getMonthlyReport = catchAsync(async (req, res, next) => {
  const { month, year, staffId, page, limit } = req.query;

  if (!staffId) {
    return next(new AppError("staffId is required", 400));
  }

  const now = new Date();
  const m = month ? parseInt(month, 10) : now.getMonth() + 1;
  const y = year ? parseInt(year, 10) : now.getFullYear();
  
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0); // Last day of the month

  const records = await Attendance.find({
    staffId,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const recordsMap = {};
  records.forEach((r) => {
    // Key by YYYY-MM-DD
    const dateStr = new Date(r.date).toISOString().split("T")[0];
    recordsMap[dateStr] = r;
  });

  const fullMonthData = [];
  const daysInMonth = endDate.getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(y, m - 1, i);
    const dateStr = d.toISOString().split("T")[0];

    if (recordsMap[dateStr]) {
      fullMonthData.push(recordsMap[dateStr]);
    } else {
      // Default to absent
      fullMonthData.push({
        staffId,
        date: d,
        status: "Absent",
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        isEditedByAdmin: false,
      });
    }
  }

  // Pagination logic
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 25;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const paginatedData = fullMonthData.slice(startIndex, endIndex);

  res.status(200).json({
    status: "success",
    data: paginatedData,
    pagination: {
      totalItems: fullMonthData.length,
      totalPages: Math.ceil(fullMonthData.length / limitNum),
      currentPage: pageNum,
      limit: limitNum
    }
  });
});

// Upsert Attendance (Update or Create by Admin)
exports.upsertAttendance = catchAsync(async (req, res, next) => {
  const { staffId, date, checkInTime, checkOutTime, status, adminNotes } = req.body;

  if (!staffId || !date) {
    return next(new AppError("staffId and date are required", 400));
  }

  const dateObj = new Date(new Date(date).toISOString().split("T")[0]);

  let totalHours = 0;
  if (checkInTime && checkOutTime) {
    const diffMs = new Date(checkOutTime) - new Date(checkInTime);
    totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  const updatedRecord = await Attendance.findOneAndUpdate(
    { staffId, date: dateObj },
    {
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null,
      status: status || "Absent",
      totalHours,
      adminNotes: adminNotes || "",
      isEditedByAdmin: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    status: "success",
    message: "Attendance updated successfully",
    data: updatedRecord,
  });
});
