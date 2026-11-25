const AssignPackage = require("../../../models/assignPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logMonitoringActivity = require("../../../utils/logMonitoringActivity");

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
        const previousPackages = assignment.packages.map((pkg) => ({
            packageId: pkg.packageId,
            name: pkg.name,
            price: pkg.price,
            status: pkg.status,
        }));

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

        await logMonitoringActivity({
            req,
            action: "Package Assignment Updated",
            module: "package-assignment",
            description: `Assigned packages updated for ${assignTo} ${assignToId}`,
            targetId: assignToId,
            targetName: `${assignTo} ${assignToId}`,
            targetType: assignTo,
            details: {
                assignmentId: assignment._id,
                packagesBefore: previousPackages,
                packagesAfter: assignment.packages.map((pkg) => ({
                    packageId: pkg.packageId,
                    name: pkg.name,
                    price: pkg.price,
                    status: pkg.status,
                })),
                updatedById: createdById,
                updatedByRole: createdBy,
            },
        });

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

    await logMonitoringActivity({
        req,
        action: "Package Assigned",
        module: "package-assignment",
        description: `Packages assigned to ${assignTo} ${assignToId}`,
        targetId: assignToId,
        targetName: `${assignTo} ${assignToId}`,
        targetType: assignTo,
        details: {
            assignmentId: newAssignment._id,
            packages: newAssignment.packages.map((pkg) => ({
                packageId: pkg.packageId,
                name: pkg.name,
                price: pkg.price,
                status: pkg.status,
            })),
            assignedById: createdById,
            assignedByRole: createdBy,
        },
    });

    return successResponse(res, "Package assigned successfully", newAssignment);
});
