const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Staff = require("../../../models/Staff");
const catchAsync = require("../../../utils/catchAsync");

exports.verifyToken = catchAsync(async (req, res, next) => {
    try {
        // ✅ adminAuthenticate middleware already verified JWT and set req.user
        const { _id, role } = req.user;
        let user = null;

        if (role === "Admin") {
            user = await Admin.findById(_id).populate("role");
        } else if (role === "Reseller") {
            user = await Reseller.findById(_id).populate("role");
        } else if (role === "Lco") {
            user = await Lco.findById(_id).populate("role");
        } else {
            user = await Staff.findById(_id).populate("role");
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Build uniform response
        const userData = {
            _id: user._id,
            name:
                user.adminName ||
                user.resellerName ||
                user.lcoName ||
                user.staffName ||
                "User",
            email: user.email,
            phoneNo: user.phoneNo || user.mobile,
            role: {
                roleName: user.role?.roleName || role,
                permissions: user.role?.permissions || {},
            },
        };

        return res.status(200).json({
            success: true,
            message: "Token verified successfully",
            data: {
                user: userData,
                roleData: user.role, // permissions/role data
            },
        });
    } catch (err) {
        console.error("❌ Verify token error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error verifying token",
        });
    }
});
