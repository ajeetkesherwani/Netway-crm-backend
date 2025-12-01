const mongoose = require("mongoose"); // Ensure mongoose is imported
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const User = require("../../../models/user");
const PriceBook = require("../../../models/priceBook");
const PurchasedPlan = require("../../../models/purchasedPlan");
// const Package = require("../../../models/package");
const Package = require("../../../models/package");
const { successResponse } = require("../../../utils/responseHandler");
const { createHistory } = require("../../../utils/userPlanHistory");

exports.planPurchase = catchAsync(async (req, res, next) => {
    const userId = req.user._id; // User ID of the logged-in user
    const { packageId, transactionId, purchasedByRole, purchasedById } = req.body;
    let amountPaid = '';

    const user = await User.findById(userId).lean();
    console.log("user.generalInformation.createdFor.type", user.generalInformation.createdFor.type);

    let matchedPackage = null;

    // For Admin: Fetch the package details directly from the Package model
    if (user.generalInformation.createdFor.type == 'Admin') {
        matchedPackage = await Package.findById(packageId).lean();
        console.log("Package for Admin:", matchedPackage);

        amountPaid = matchedPackage.basePrice;
    }

    // For non-Admin users: Fetch the package from the PriceBook
    if (user.generalInformation.createdFor.type !== 'Admin') {
        const priceBook = await PriceBook.findOne({
            'package.packageId': mongoose.Types.ObjectId(packageId) // Use ObjectId for filtering
        }).lean();

        console.log("priceBook", priceBook);

        if (priceBook) {
            matchedPackage = priceBook.package.find(pkg => pkg.packageId.toString() === packageId);
            console.log("Matched Package from PriceBook:", matchedPackage);
        } else {
            console.log("No package found with the given ID.");
        }

        amountPaid = matchedPackage.retailerPrice;
    }

    // If no package is found, return an error
    if (!matchedPackage) {
        return next(new AppError('Package not found', 404)); 
    }

    // Find the existing PurchasedPlan by packageId and userId
    const purchasedPlan = await PurchasedPlan.findOne({ userId, packageId });

    if (purchasedPlan) {
        // Renew the plan if it exists
        const renewedOn = new Date(); // Current date when the plan is renewed
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + 30); // Set the new expiry date (you should calculate this based on your renewal logic)
        const previousExpiryDate = purchasedPlan.expiryDate; // Previous expiry date

        purchasedPlan.renewals.push({
            previousExpiryDate,
            newExpiryDate,
            amountPaid,
            transactionId,
            paymentMethod: "Online", // Assuming payment method is always Online for now
            remarks: "",
            renewedOn,
        });

        purchasedPlan.expiryDate = newExpiryDate;
        purchasedPlan.isRenewed = true; 

        // Save the updated PurchasedPlan document
        await purchasedPlan.save();
        
    await createHistory(userId,packageId,amountPaid,"renewal","Online","","");
      
        return successResponse(res, 200, { message: "Plan renewed successfully.", purchasedPlan });
    } else {
        const newExpiryDate = new Date(); 
        const newPurchasedPlan = new PurchasedPlan({
            userId,
            packageId,
            amountPaid,
            transactionId,
            purchasedByRole, 
            purchasedById: userId,   
            paymentMethod: "Online",
            remarks: "",
            expiryDate: newExpiryDate,
            status: "active",
            startDate: new Date(),
        });

        // Save the new PurchasedPlan document
        await newPurchasedPlan.save();
 
          console.log(userId,packageId,amountPaid,"purched plan")
        await createHistory(userId,packageId,amountPaid,"purchase","Online","","");
        return successResponse(res, 201, { message: "New plan purchased successfully.", purchasedPlan: newPurchasedPlan });
    }
});
