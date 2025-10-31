const User = require("../../../models_old/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOneUser = (async(req, res, next) => {

    const { userId } = req.params;
    if(!userId) return next(new AppError("userId is required", 400));

    const user = await User.find({ _id: userId })
    .select("name email mobileNo profileImage createdAt")
    .lean();
    if(!user) return next(new AppError("user not found", 404));

    successResponse(res, "user Details", user);

});