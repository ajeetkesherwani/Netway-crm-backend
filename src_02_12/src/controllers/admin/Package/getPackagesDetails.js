const Package = require("../../../models/package");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPackagesDetails = (async (req, res, next) => {

    const { id } = req.params;
    if (!id) return next(new AppError("id is required", 400));

    const package = await Package.findById(id);
    if (!package) return next(new AppError("package not found", 404));

    successResponse(res, "packages details found successfully", package);

});