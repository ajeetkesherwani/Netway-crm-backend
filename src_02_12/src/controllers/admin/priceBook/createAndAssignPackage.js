const PriceBook = require("../../../models/priceBook");
const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createPriceBook = catchAsync(async (req, res, next) => {
    const {
        priceBookName,
        fromDate,
        toDate,
        status,
        description,
        priceBookFor,
        package: packageList,
        assignedTo
    } = req.body;

    if (!priceBookName || !fromDate || !toDate || !priceBookFor || !packageList || !assignedTo) {
        return next(new AppError("All fields are required", 400));
    }

    if (req.user.role === "Lco") {
        return next(new AppError("Lco cannot assign packages", 403));
    }

    if (req.user.role === "Reseller" && priceBookFor !== "Lco") {
        return next(new AppError("Reseller can only assign packages to Lco", 403));
    }

    if (req.user.role === "Admin" && !["Reseller", "Lco"].includes(priceBookFor)) {
        return next(new AppError("Admin can only assign packages to Reseller or Lco", 403));
    }

    const priceBook = new PriceBook({
        priceBookName,
        fromDate,
        toDate,
        status: status,
        description: description || "",
        priceBookFor,
        priceBookForModel: priceBookFor,
        package: packageList,
        assignedTo,
        createdBy: req.user.role,
        createdById: req.user._id
    });

    await priceBook.save();

    for (let id of assignedTo) {
        const existingAssignment = await AssignPackage.findOne({
            assignTo: priceBookFor,
            assignToId: id
        });

        if (existingAssignment) {
            // Filter packages: only assign new ones that are not already assigned
            const newPackages = packageList.filter(pkg =>
                !existingAssignment.packages.some(p => p.packageId.toString() === pkg.packageId)
            );

            if (newPackages.length > 0) {
                existingAssignment.packages.push(...newPackages);
                await existingAssignment.save();
            }
            continue; // skip creating new assignment
        }

        // Create new assignment if no packages exist for this reseller/LCO
        const newAssignment = new AssignPackage({
            assignTo: priceBookFor,
            assignToId: id,
            packages: packageList,
            createdBy: req.user.role,
            createdById: req.user._id
        });

        await newAssignment.save();
    }

    successResponse(res, "New PriceBook created and packages assigned successfully", priceBook);

});
