// const mongoose = require("mongoose"); // Ensure mongoose is imported
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const User = require("../../../models/user");
// const PriceBook = require("../../../models/priceBook");
// const PurchasedPlan = require("../../../models/purchasedPlan");
// // const Package = require("../../../models/package");
// const Package = require("../../../models/package");
// const { successResponse } = require("../../../utils/responseHandler");
// const { createHistory } = require("../../../utils/userPlanHistory");

// exports.planPurchase = catchAsync(async (req, res, next) => {
//     const userId = req.user._id; // User ID of the logged-in user
//     const { packageId, transactionId, purchasedByRole, purchasedById } = req.body;
//     let amountPaid = '';

//     const user = await User.findById(userId).lean();
//     console.log("user.generalInformation.createdFor.type", user.generalInformation.createdFor.type);

//     let matchedPackage = null;

//     // For Admin: Fetch the package details directly from the Package model
//     if (user.generalInformation.createdFor.type == 'Admin') {
//         matchedPackage = await Package.findById(packageId).lean();
//         console.log("Package for Admin:", matchedPackage);

//         amountPaid = matchedPackage.basePrice;
//     }

//     // For non-Admin users: Fetch the package from the PriceBook
//     if (user.generalInformation.createdFor.type !== 'Admin') {
//         const priceBook = await PriceBook.findOne({
//             'package.packageId': mongoose.Types.ObjectId(packageId) // Use ObjectId for filtering
//         }).lean();

//         console.log("priceBook", priceBook);

//         if (priceBook) {
//             matchedPackage = priceBook.package.find(pkg => pkg.packageId.toString() === packageId);
//             console.log("Matched Package from PriceBook:", matchedPackage);
//         } else {
//             console.log("No package found with the given ID.");
//         }

//         amountPaid = matchedPackage.retailerPrice;
//     }

//     // If no package is found, return an error
//     if (!matchedPackage) {
//         return next(new AppError('Package not found', 404)); 
//     }

//     // Find the existing PurchasedPlan by packageId and userId
//     const purchasedPlan = await PurchasedPlan.findOne({ userId, packageId });

//     if (purchasedPlan) {
//         // Renew the plan if it exists
//         const renewedOn = new Date(); // Current date when the plan is renewed
//         const newExpiryDate = new Date();
//         newExpiryDate.setDate(newExpiryDate.getDate() + 30); // Set the new expiry date (you should calculate this based on your renewal logic)
//         const previousExpiryDate = purchasedPlan.expiryDate; // Previous expiry date

//         purchasedPlan.renewals.push({
//             previousExpiryDate,
//             newExpiryDate,
//             amountPaid,
//             transactionId,
//             paymentMethod: "Online", // Assuming payment method is always Online for now
//             remarks: "",
//             renewedOn,
//         });

//         purchasedPlan.expiryDate = newExpiryDate;
//         purchasedPlan.isRenewed = true; 

//         // Save the updated PurchasedPlan document
//         await purchasedPlan.save();
        
//     await createHistory(userId,packageId,amountPaid,"renewal","Online","","");
      
//         return successResponse(res, 200, { message: "Plan renewed successfully.", purchasedPlan });
//     } else {
//         const newExpiryDate = new Date(); 
//         const newPurchasedPlan = new PurchasedPlan({
//             userId,
//             packageId,
//             amountPaid,
//             transactionId,
//             purchasedByRole, 
//             purchasedById: userId,   
//             paymentMethod: "Online",
//             remarks: "",
//             expiryDate: newExpiryDate,
//             status: "active",
//             startDate: new Date(),
//         });

//         // Save the new PurchasedPlan document
//         await newPurchasedPlan.save();
 
//           console.log(userId,packageId,amountPaid,"purched plan")
//         await createHistory(userId,packageId,amountPaid,"purchase","Online","","");
//         return successResponse(res, 201, { message: "New plan purchased successfully.", purchasedPlan: newPurchasedPlan });
//     }
// });


const mongoose = require("mongoose");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const User = require("../../../models/user");
const PriceBook = require("../../../models/priceBook");
const Package = require("../../../models/package");
const PurchasedPlan = require("../../../models/purchasedPlan");
const PlanPayment = require("../../../models/planPayment");

const { successResponse } = require("../../../utils/responseHandler");
const { createHistory } = require("../../../utils/userPlanHistory");

exports.planPurchase = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const {
        packageId,
        transactionId,
        purchasedByRole,
        purchasedById
    } = req.body;

    // -----------------------------------------
    // 1. Basic Validation
    // -----------------------------------------

    if (!packageId || !transactionId) {
        return next(
            new AppError("packageId and transactionId are required", 400)
        );
    }

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
        return next(new AppError("Invalid packageId", 400));
    }

    // -----------------------------------------
    // 2. Find User
    // -----------------------------------------

    const user = await User.findById(userId).lean();

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const userType = user.generalInformation?.createdFor?.type;

    if (!userType) {
        return next(new AppError("User type not found", 400));
    }

    // -----------------------------------------
    // 3. Verify CCAvenue Payment
    // -----------------------------------------

    const payment = await PlanPayment.findOne({
        userId,
        packageId,
        status: "Paid",
        $or: [
            { orderId: transactionId },
            { gatewayTrackingId: transactionId }
        ]
    });

    if (!payment) {
        return next(
            new AppError(
                "A verified CCAvenue payment is required to purchase a plan",
                400
            )
        );
    }

    // -----------------------------------------
    // 4. Check Already Processed Payment
    // -----------------------------------------

    if (payment.purchasedPlanId) {
        const existingProcessedPlan = await PurchasedPlan.findById(
            payment.purchasedPlanId
        );

        if (existingProcessedPlan) {
            return successResponse(
                res,
                200,
                {
                    message: "Plan payment has already been processed",
                    purchasedPlan: existingProcessedPlan
                }
            );
        }
    }

    // -----------------------------------------
    // 5. Fetch Package Dynamically
    // -----------------------------------------

    let matchedPackage = null;
    let amountPaid = 0;

    if (userType === "Admin") {

        matchedPackage = await Package.findById(packageId).lean();

        if (!matchedPackage) {
            return next(new AppError("Package not found", 404));
        }

        amountPaid = matchedPackage.basePrice;

    } else {

        const priceBook = await PriceBook.findOne({
            "package.packageId": new mongoose.Types.ObjectId(packageId)
        }).lean();

        if (priceBook) {
            matchedPackage = priceBook.package.find(
                pkg => pkg.packageId.toString() === packageId.toString()
            );
        }

        if (!matchedPackage) {
            return next(new AppError("Package not found in PriceBook", 404));
        }

        amountPaid = matchedPackage.retailerPrice;
    }

    if (amountPaid === undefined || amountPaid === null) {
        return next(new AppError("Package price not found", 400));
    }

    // -----------------------------------------
    // 6. Validate Payment Amount
    // -----------------------------------------

    // Adjust payment.amount according to your PlanPayment schema.
    if (Number(payment.amount) !== Number(amountPaid)) {
        return next(
            new AppError("Payment amount does not match package price", 400)
        );
    }

    // -----------------------------------------
    // 7. Calculate Dynamic Expiry
    // -----------------------------------------

    const durationDays = Number(
        matchedPackage.durationDays || matchedPackage.validityDays || 30
    );

    if (!Number.isFinite(durationDays) || durationDays <= 0) {
        return next(new AppError("Invalid package duration", 400));
    }

    const now = new Date();

    // -----------------------------------------
    // 8. Find Existing Purchased Plan
    // -----------------------------------------

    let purchasedPlan = await PurchasedPlan.findOne({
        userId,
        packageId
    });

    let historyType;

    if (purchasedPlan) {

        // -----------------------------------------
        // 9. Renew Existing Plan
        // -----------------------------------------

        const previousExpiryDate = purchasedPlan.expiryDate;

        // Extend from existing expiry if still active.
        // Otherwise, start from current date.
        const renewalStartDate =
            previousExpiryDate && previousExpiryDate > now
                ? previousExpiryDate
                : now;

        const newExpiryDate = new Date(renewalStartDate);

        newExpiryDate.setDate(
            newExpiryDate.getDate() + durationDays
        );

        purchasedPlan.renewals.push({
            previousExpiryDate,
            newExpiryDate,
            amountPaid,
            transactionId,
            paymentMethod: "Online",
            remarks: "",
            renewedOn: now
        });

        purchasedPlan.expiryDate = newExpiryDate;
        purchasedPlan.amountPaid = amountPaid;
        purchasedPlan.transactionId = transactionId;
        purchasedPlan.status = "active";
        purchasedPlan.isRenewed = true;

        await purchasedPlan.save();

        historyType = "renewal";

    } else {

        // -----------------------------------------
        // 10. Create New Purchased Plan
        // -----------------------------------------

        const newExpiryDate = new Date(now);

        newExpiryDate.setDate(
            newExpiryDate.getDate() + durationDays
        );

        purchasedPlan = new PurchasedPlan({
            userId,
            packageId,
            amountPaid,
            transactionId,
            purchasedByRole,
            purchasedById: purchasedById || userId,
            paymentMethod: "Online",
            remarks: "",
            expiryDate: newExpiryDate,
            status: "active",
            startDate: now
        });

        await purchasedPlan.save();

        historyType = "purchase";
    }

    // -----------------------------------------
    // 11. Update Payment as Processed
    // -----------------------------------------

    payment.purchasedPlanId = purchasedPlan._id;
    await payment.save();

    // -----------------------------------------
    // 12. Create History
    // -----------------------------------------

    await createHistory(
        userId,
        packageId,
        amountPaid,
        historyType,
        "Online",
        "",
        ""
    );

    // -----------------------------------------
    // 13. Final Response
    // -----------------------------------------

    return successResponse(
        res,
        purchasedPlan.isRenewed ? 200 : 201,
        {
            message:
                historyType === "renewal"
                    ? "Plan renewed successfully."
                    : "New plan purchased successfully.",
            purchasedPlan
        }
    );
});
