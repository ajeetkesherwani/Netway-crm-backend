const Delas = require("../../../models_old/dealsOfTheDay");
const paginate = require("../../../utils/paginate");

exports.getDealsOfTheDay = async (req, res) => {
  try {

    // const delas = await Delas.find()
    //   .populate("product_id", "name price image")
    //   .populate("cat_id", "name")
    //   .populate("serviceId", "name")
    //   .sort({ createdAt: -1 });

    const { page, limit } = req.query;

    const delas = await paginate(Delas, {}, {
      page,
      limit,
      populate: { path: "product_id", select: "name price image" },
      populate: { path: "cat_id", select: "name" },
      populate: { path: "serviceId", select: "name" },
      sort: { createdAt: -1 }
    })


    if (!delas || delas.paginateData.length === 0 ) {
      return res
        .status(400)
        .json({ success: false, message: "Deals not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deals of the data fetched successfully",
      count: delas.paginateData.length,
      data: delas,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
