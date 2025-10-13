const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllInActiveUsers = catchAsync(async (req, res, next) => {
    const { _id, role } = req.user;
    const { filter } = req.query;

    // all active user
    let query = { status: "Inactive" };

    // Restrict Reseller and LCO to their own users
    if (role === "Retailer" || role === "Lco") {
        query["generalInformation.createdFor.id"] = _id;
        query["generalInformation.createdFor.type"] = role;
    }
    // Admin sees all active users → no further filter

    // Optional Date filter
    if (filter) {
        const now = new Date();
        let startDate;

        switch (filter.toLowerCase()) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                const day = now.getDay(); // 0 = Sunday
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                return next(new AppError("Invalid filter type. Use today, week, or month.", 400));
        }

        query.createdAt = { $gte: startDate };
    }

    // Fetch users
    const users = await User.find(query)
        .select(
            "generalInformation.name generalInformation.username generalInformation.email generalInformation.phone status createdAt"
        )
        .sort({ createdAt: -1 });

    successResponse(res, "InActive users found successfully", {
        results: users.length,
        data: users
    });
});
