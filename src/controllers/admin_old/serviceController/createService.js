const Service = require("../../../models_old/service");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createService = catchAsync(async (req, res) => {
  let { name } = req.body;

  if (!name || !name.trim()) return new AppError(`name is required,`, 400);

  let imagePath;
  if (req.files && req.files.image) {
    const url = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
    imagePath = url;
  } else {
    imagePath = "";
  }

  service = new Service({ name, image: imagePath });
  message = "Service added successfully";

  await service.save();

  return res.status(201).json({
    status: true,
    message: message,
    data: { service },
  });
});
