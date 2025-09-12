const Admin = require("../../../models_old/admin");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllUserList = catchAsync(async (req, res) => {

  const { page, limit } = req.query;

  const admins = await paginate(Admin, {}, {
    page, 
    limit, 
    populate: "role", 
    sort: { createdAt: -1 }
  });

  successResponse(res, "Admins fetched successfully", { admins });

});
