const Vendor = require("../../../models_old/vendor");
const paginate = require("../../../utils/paginate");

exports.getVendorList = async (req, res) => {
  try {

    const{ page, limit } = req.query;

    const allVendor = await paginate(Vendor, {}, {
      page,
      limit,
      sort:{ createdAt: -1 },
      select: "shopName shopId serviceId mobile profileImg status isBlocked wallet_balance",
      populate:  { path: "serviceId", select: "name" },

    })

    if (!allVendor || allVendor.paginateData.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: "all Vendor found",
      count: allVendor.paginateData.length,
      data: allVendor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
