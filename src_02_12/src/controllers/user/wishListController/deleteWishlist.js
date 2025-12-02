const Wishlist = require("../../../models/wishlist");
const AppError = require("../../../utils/AppError");

exports.deleteWishlist = (async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("id id required", 400));

    const deleteList = await Wishlist.findByIdAndDelete(id);
    if(!deleteList) return next(new AppError("wishlist not found", 404));

    res.status(200).json({ status: true, message: "wishlist deleted successfully",data: deleteList });

});