const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.assignPackageToReseller = catchAsync(async (req, res, next) => {
    const { assignTo, assignToId, package: packageArray } = req.body;

    // Validation
    if (!assignTo || !["Reseller", "Lco"].includes(assignTo)) {
        return next(new AppError("assignTo is invalid or required", 400));
    }

    if (!assignToId) {
        return next(new AppError("assignToId is required", 400));
    }

    if (!packageArray || !Array.isArray(packageArray) || packageArray.length === 0) {
        return next(new AppError("package must be a non-empty array", 400));
    }

    // Take creator details from token
    const createdBy = req.user.role;   // "Admin" or "Reseller"
    const createdById = req.user._id;
    

    // Check if assignment already exists
    let assignment = await AssignPackage.findOne({ assignTo, assignToId });

    if (assignment) {
        // Merge or update packages
        packageArray.forEach(newPkg => {
            const existingPkgIndex = assignment.packages.findIndex(
                pkg => pkg.packageId.toString() === newPkg.packageId
            );

            if (existingPkgIndex !== -1) {
                // Update existing package
                assignment.packages[existingPkgIndex] = {
                    ...assignment.packages[existingPkgIndex]._doc,
                    ...newPkg
                };
            } else {
                // Add new package
                assignment.packages.push(newPkg);
            }
        });

        assignment.createdBy = createdBy;
        assignment.createdById = createdById;
       
        await assignment.save();

        return successResponse(res, "Package assignment updated successfully", assignment);
    }

    // Create new assignment if not exists
    const newAssignment = new AssignPackage({
        assignTo,
        assignToId,
        packages: packageArray,
        createdBy,
        createdById
    });

    await newAssignment.save();

    return successResponse(res, "Package assigned successfully", newAssignment);
});
