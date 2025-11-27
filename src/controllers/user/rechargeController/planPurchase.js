const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const User = require("../../../models/user");
const PriceBook = require("../../../models/priceBook");
const { successResponse } = require("../../../utils/responseHandler");

exports.planPurchase = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { packageId } = req.body;

    const user = User.findById(userId).lean();
    let package = '';
    if(user.generalInformation.createdFor.type == 'Admin'){
        package = Package.findById({packageId}).lean();
    }
    
    if(user.generalInformation.createdFor.type != 'Admin'){
        const priceBook = PriceBook.find({})
        package = Package.findById({packageId}).lean();
    }


});
