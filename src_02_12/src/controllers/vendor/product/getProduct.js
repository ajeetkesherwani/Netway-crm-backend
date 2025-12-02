const ProductModel = require("../../../models/products");

const getProduct = async (req, res) => {
  try {
    // const products = await ProductModel.find().populate('category fabric vendor');
    const products = await ProductModel.find();

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getProduct;
