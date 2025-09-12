const Service = require("../../../models_old/service");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateService = catchAsync(async (req, res) => {
  console.log(req.params);
  let id = req.params.id;
  let { name } = req.body;

  if (!name || !name.trim()) return new AppError(`name is required,`, 400);

  let service = await Service.findOne({ _id: id });

  let imageNew = service.image;
  if (req.files && req.files.image && req.files.image.length > 0) {
    // Delete the old primary image if available.
    if (service.image) {
      await deleteOldFiles(service.image);
    }
    imageNew = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
  }

  service.name = name || service.name;
  service.image = imageNew;

  await service.save();

  return res.status(200).json({
    status: true,
    message: "Service updated successfully.",
    data: { service },
  });
});
