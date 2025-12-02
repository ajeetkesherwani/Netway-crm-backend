const mongoose = require("mongoose");
const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRenewedUsersDetailsByFilter = catchAsync(async (req, res, next) => {
    const { filter = "day", year, month } = req.query;
    const { role, _id } = req.user;

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-based month

    // === ROLE BASED FILTER ===
    let matchCondition = {};
    let name = "";

    if (role === "Reseller") {
        matchCondition["generalInformation.createdFor.type"] = "Retailer";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);

        const reseller = await Reseller.findById(_id).select("resellerName").lean();
        name = reseller?.resellerName || "Unknown Reseller";
    }
    else if (role === "Lco") {
        matchCondition["generalInformation.createdFor.type"] = "Lco";
        matchCondition["generalInformation.createdFor.id"] = new mongoose.Types.ObjectId(_id);

        const lco = await Lco.findById(_id).select("lcoName").lean();
        name = lco?.lcoName || "Unknown LCO";
    }
    else if (role === "Admin") {
        name = "Admin Dashboard";
    }

    // === DATE FILTER ===
    let startDate, endDate, format;
    if (filter === "day") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        format = "day";
    } else if (filter === "week") {
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
        format = "week";
    } else if (filter === "month") {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
        format = "month";
    } else {
        return next(new AppError("Invalid filter. Use day/week/month", 400));
    }

    // === FETCH USERS (role based) ===
    const users = await User.find(matchCondition).lean();
    const renewedUsers = [];

    for (const user of users) {
        const plan = await PurchasedPlan.findOne({
            userId: user._id,
            isRenewed: true,
        })
            .populate("packageId", "name basePrice validity")
            .lean();

        if (!plan || !plan.renewals?.length) continue;

        const lastRenewal = plan.renewals[plan.renewals.length - 1];
        const renewedOn = new Date(lastRenewal.renewedOn);
        if (renewedOn < startDate || renewedOn > endDate) continue;

        renewedUsers.push({
            username: user.generalInformation?.username || "",
            customerName: user.generalInformation?.name || "",
            role: user.generalInformation?.createdFor?.type || "",
            ...(role === "Admin" && {
                createdForName:
                    user.generalInformation?.createdFor?.id?.generalInformation?.name || "N/A",
            }),
            currentPlan: plan.packageId?.name || "N/A",
            planValidity: plan.packageId?.validity
                ? `${plan.packageId.validity.number} ${plan.packageId.validity.unit}`
                : "N/A",
            amountPaid: lastRenewal.amountPaid || 0,
            walletBalance: user.walletBalance || 0,
            renewedOn, // only for internal filtering
        });
    }

    // === GROUPING LOGIC ===
    let result = [];

    if (format === "day") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayUsers = renewedUsers.filter(
                (u) =>
                    new Date(u.renewedOn).getDate() === d &&
                    new Date(u.renewedOn).getMonth() === selectedMonth
            );
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", {
                    month: "long",
                })}`,
                count: dayUsers.length,
                users: dayUsers,
            });
        }
    } else if (format === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let startDay = 1;
        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const sDate = new Date(selectedYear, selectedMonth, startDay);
            const eDate = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);
            const weekUsers = renewedUsers.filter((u) => {
                const d = new Date(u.renewedOn);
                return d >= sDate && d <= eDate;
            });
            result.push({
                label: `Week ${result.length + 1} (${startDay}-${endDay} ${sDate.toLocaleString(
                    "default",
                    { month: "short" }
                )})`,
                count: weekUsers.length,
                users: weekUsers,
            });
            startDay += 7;
        }
    } else if (format === "month") {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        for (let m = 0; m < 12; m++) {
            const monthUsers = renewedUsers.filter(
                (u) => new Date(u.renewedOn).getMonth() === m
            );
            result.push({
                label: monthNames[m],
                count: monthUsers.length,
                users: monthUsers,
            });
        }
    }

    // === REMOVE renewedOn FROM FINAL RESPONSE ===
    result = result.map((r) => ({
        ...r,
        users: r.users.map(({ renewedOn, ...rest }) => rest),
    }));

    // === FINAL RESPONSE ===
    return successResponse(res, "Role-wise renewed user details fetched successfully", {
        role,
        name,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        totalRenewedUsers: renewedUsers.length,
        result,
    });
});
