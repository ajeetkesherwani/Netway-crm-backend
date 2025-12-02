const PriceBook = require("../../../models/priceBook");
const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updatePriceBook = catchAsync(async (req, res, next) => {
    const { priceBookId } = req.params;
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

    if (!priceBookId) return next(new AppError("priceBookId is required", 400));

    const priceBook = await PriceBook.findById(priceBookId);
    if (!priceBook) return next(new AppError("PriceBook not found", 404));

    // Role validation
    if (req.user.role === "Lco") {
        return next(new AppError("Lco cannot update priceBook", 403));
    }

    if (req.user.role === "Reseller" && priceBookFor && priceBookFor !== "Lco") {
        return next(new AppError("Reseller can only assign/update packages to Lco", 403));
    }

    if (req.user.role === "Admin" && priceBookFor && !["Reseller", "Lco"].includes(priceBookFor)) {
        return next(new AppError("Admin can only assign/update packages to Reseller or Lco", 403));
    }

    // Update fields if provided
    if (priceBookName) priceBook.priceBookName = priceBookName;
    if (fromDate) priceBook.fromDate = fromDate;
    if (toDate) priceBook.toDate = toDate;
    if (status) priceBook.status = status;
    if (description) priceBook.description = description;
    if (priceBookFor) {
        priceBook.priceBookFor = priceBookFor;
        priceBook.priceBookForModel = priceBookFor;
    }
    if (packageList) priceBook.package = packageList;
    if (assignedTo) priceBook.assignedTo = assignedTo;

    await priceBook.save();

    // Update assigned packages
    if (assignedTo && packageList) {
        for (let id of assignedTo) {
            const existingAssignment = await AssignPackage.findOne({
                assignTo: priceBookFor,
                assignToId: id
            });

            if (existingAssignment) {
                // Filter packages: only add new ones
                const newPackages = packageList.filter(pkg =>
                    !existingAssignment.packages.some(p => p.packageId.toString() === pkg.packageId)
                );

                if (newPackages.length > 0) {
                    existingAssignment.packages.push(...newPackages);
                    await existingAssignment.save();
                }
                continue; // skip creating new assignment
            }

            // Create new assignment if not exist
            const newAssignment = new AssignPackage({
                assignTo: priceBookFor,
                assignToId: id,
                packages: packageList,
                createdBy: req.user.role,
                createdById: req.user._id
            });

            await newAssignment.save();
        }
    }

    successResponse(res, "PriceBook updated and packages reassigned successfully", priceBook);
});
