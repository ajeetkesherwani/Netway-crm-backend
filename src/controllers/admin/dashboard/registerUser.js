const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getRegisterUsers = catchAsync(async (req, res, next) => {
    const { _id, role } = req.user; // user info from JWT
    const { filter } = req.query;

    let query = {
        "generalInformation.createdFor.id": _id,
        "generalInformation.createdFor.type": role
    };

    // Date filter
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

    const users = await User.find(query)
        .select("generalInformation.name generalInformation.username generalInformation.email generalInformation.phone status createdAt")
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        results: users.length,
        data: users
    });
});
