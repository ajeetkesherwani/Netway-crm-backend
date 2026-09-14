const Hardware = require("../../../models/hardware");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const xlsx = require("xlsx");
const fs = require("fs");

exports.bulkUploadHardware = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.file || req.files.file.length === 0) {
    return next(new AppError("Please upload an xlsx file", 400));
  }

  const filePath = req.files.file[0].path;

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const hardwares = xlsx.utils.sheet_to_json(sheet);

    if (!hardwares || hardwares.length === 0) {
      return next(new AppError("The uploaded file is empty or invalid", 400));
    }

    // Validate the minimal required fields for bulk insert
    for (const item of hardwares) {
      if (!item.hardwareName) {
        return next(new AppError("Each item must have a hardwareName", 400));
      }
    }

    const result = await Hardware.insertMany(hardwares);

    // Optional: cleanup the uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json({
      status: "success",
      message: `${result.length} Hardware items uploaded successfully`,
      data: {
        hardwares: result,
      },
    });
  } catch (error) {
    // Ensure file is deleted if there's an error parsing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return next(new AppError("Error parsing the file: " + error.message, 400));
  }
});
