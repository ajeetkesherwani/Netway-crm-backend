const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteLoc = (async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("id is requred",400));

    const lco = await Lco.findByIdAndDelete(id);
    if(!lco) return next(new AppError("lco not found",404));

    successResponse(res, "lco deleted successfully", lco);

});