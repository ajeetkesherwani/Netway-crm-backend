const AddToCart = require("../../../models/addToCart");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteAddTOCart = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    if (!id) return next(new AppError("id is required", 400));

    const deleteCart = await AddToCart.findByIdAndDelete(id);
    if (!deleteCart) return next(new AppError("Cart not found", 404));

    res.status(200).json({ status: true, message: "Cart deleted successfully", data: deleteCart });

});