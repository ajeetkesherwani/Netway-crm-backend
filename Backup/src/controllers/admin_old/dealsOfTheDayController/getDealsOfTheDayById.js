const Delas = require("../../../models_old/dealsOfTheDay");

exports.getDealsOfTheDayById = async (req, res) => {
  const id = req.params.id;
  try {
    const delas = await Delas.findById(id);
    if (!delas) {
      return res
        .status(400)
        .json({ success: false, message: "Deals not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deals of the data fetched successfully",
      count: delas.length,
      data: delas,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
