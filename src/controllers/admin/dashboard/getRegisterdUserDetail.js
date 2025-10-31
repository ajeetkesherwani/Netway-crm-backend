const mongoose = require("mongoose");
const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRegisterUsersByFilter = catchAsync(async (req, res, next) => {
    const { filter = "day", year, month } = req.query;
    const { role, _id } = req.user;

    const now = new Date();
    const selectedYear = parseInt(year) || now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS month = 0-based

    // === ROLE BASED MATCH ===
    let matchCondition = {};
    let name = "";

    if (role === "Reseller") {
        matchCondition["generalInformation.createdBy.id"] = new mongoose.Types.ObjectId(_id);
        const reseller = await Reseller.findById(_id).select("resellerName").lean();
        console.log(reseller, "reseller name");
        name = reseller?.resellerName || "Unknown Reseller";
    } else if (role === "Lco") {
        matchCondition["generalInformation.createdBy.id"] = new mongoose.Types.ObjectId(_id);
        const lco = await Lco.findById(_id).select("lcoName").lean();
        console.log("lco", lco);
        name = lco?.lcoName || "Unknown LCO";
    } else if (role === "Admin") {
        name = "Admin Dashboard";
    }

    // === DATE FILTER (supports day/week/month/year) ===
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

    matchCondition.createdAt = { $gte: startDate, $lte: endDate };

    // === FETCH USERS ===
    const users = await User.find(matchCondition)
        .populate("generalInformation.createdFor.id", "generalInformation.name generalInformation.username generalInformation.phone generalInformation.email")
        .lean();

    // === ENRICH USER DATA ===
    const usersWithPlans = await Promise.all(
        users.map(async (user) => {
            const purchasedPlan = await PurchasedPlan.findOne({ userId: user._id })
                .sort({ purchaseDate: -1 })
                .populate("packageId", "name basePrice validity")
                .lean();

            let plan = {
                packageName: "N/A",
                planMRP: 0,
                planValidity: "N/A",
                planStatus: "Inactive",
                planStartDate: null,
                expiryDate: null,
                amountPaid: 0
            };

            if (purchasedPlan) {
                let { startDate, expiryDate, amountPaid, status } = purchasedPlan;

                // If renewed, take last renewal data
                if (purchasedPlan.isRenewed && purchasedPlan.renewals?.length > 0) {
                    const lastRenewal = purchasedPlan.renewals[purchasedPlan.renewals.length - 1];
                    startDate = lastRenewal.renewedOn;
                    expiryDate = lastRenewal.newExpiryDate;
                    amountPaid = lastRenewal.amountPaid;
                }

                if (purchasedPlan.packageId) {
                    const pkg = purchasedPlan.packageId;
                    plan = {
                        packageName: pkg.name,
                        planMRP: pkg.basePrice || 0,
                        planValidity: pkg.validity
                            ? `${pkg.validity.number} ${pkg.validity.unit}`
                            : "N/A",
                        planStatus: status || "Inactive",
                        planStartDate: startDate,
                        expiryDate,
                        amountPaid
                    };
                }
            }

            // === Created For Info (Admin only)
            const createdForType = user.generalInformation?.createdFor?.type || "";
            const createdForName =
                role === "Admin"
                    ? user.generalInformation?.createdFor?.id?.generalInformation?.name || "N/A"
                    : undefined;

            return {
                username: user.generalInformation?.username || "",
                customerName: user.generalInformation?.name || "",
                role: createdForType,
                ...(role === "Admin" && { createdForName }),
                currentPlan: plan.packageName,
                walletBalance: user.walletBalance || 0,
                planValidity: plan.planValidity,
                planStatus: plan.planStatus,
                planStartDate: plan.planStartDate,
                expiryDate: plan.expiryDate,
                amountPaid: plan.amountPaid,
                createdAt: user.createdAt
            };
        })
    );

    // === GROUPING (Day / Week / Month) ===
    let result = [];

    if (format === "day") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayUsers = usersWithPlans.filter(
                (u) =>
                    new Date(u.createdAt).getDate() === d &&
                    new Date(u.createdAt).getMonth() === selectedMonth
            );
            result.push({
                label: `${d} ${new Date(selectedYear, selectedMonth).toLocaleString("default", {
                    month: "long"
                })}`,
                count: dayUsers.length,
                users: dayUsers
            });
        }
    } else if (format === "week") {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        let startDay = 1;
        while (startDay <= daysInMonth) {
            const endDay = Math.min(startDay + 6, daysInMonth);
            const startDate = new Date(selectedYear, selectedMonth, startDay);
            const endDate = new Date(selectedYear, selectedMonth, endDay, 23, 59, 59);
            const weekUsers = usersWithPlans.filter((u) => {
                const createdDate = new Date(u.createdAt);
                return createdDate >= startDate && createdDate <= endDate;
            });
            result.push({
                label: `Week ${result.length + 1} (${startDay}-${endDay} ${startDate.toLocaleString(
                    "default",
                    { month: "short" }
                )})`,
                count: weekUsers.length,
                users: weekUsers
            });
            startDay += 7;
        }
    } else if (format === "month") {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (let m = 0; m < 12; m++) {
            const monthUsers = usersWithPlans.filter(
                (u) => new Date(u.createdAt).getMonth() === m
            );
            result.push({
                label: monthNames[m],
                count: monthUsers.length,
                users: monthUsers
            });
        }
    }

    // === FINAL RESPONSE ===
    return successResponse(res, "Registered user details fetched successfully", {
        role,
        name,
        filter,
        year: selectedYear,
        month: selectedMonth + 1,
        totalRegisteredUsers: usersWithPlans.length,
        result
    });
});
