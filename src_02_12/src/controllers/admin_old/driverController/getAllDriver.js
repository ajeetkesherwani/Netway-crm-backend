const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const paginate = require("../../../utils/paginate");


exports.getAllDriver = catchAsync(async(req, res, next) => {

    // const driver = await Driver.find();

    const { page, limit } = req.query;

    const driver = await paginate(Driver, {}, {
        page,
        limit,
        sort: { createdAt: -1 }
    });

    if(!driver) return next(new AppError("Driver not found", 404));
    
    successResponse(res, "Driver found successfully", driver);

});