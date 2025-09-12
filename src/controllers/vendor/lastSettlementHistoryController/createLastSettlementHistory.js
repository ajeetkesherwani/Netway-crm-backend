const LastSettlementHistory = require("../../../models/lastSettlementHistory");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLastSettlementHistory = catchAsync(async(req, res, next) => {

    const { lastSettlementAmount, lastSettlementDate, file } = req.body;

    const uploadFile = req.files?.file[0].path;
    console.log("file", uploadFile);

    const createHistory = await LastSettlementHistory.create({
        vendorId: req.vendor._id,
        lastSettlementAmount,
        lastSettlementDate,
        file: uploadFile
    });

    await createHistory.save();

    successResponse(res, "last SettlementHistory created successfully", createHistory);

});