const ProductModel = require("../../../models/products");

const updateStockAndStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isStock, status } = req.body;

    const updateFields = {};

    if (typeof isStock === "boolean") {
      updateFields.isStock = isStock;
    }

    if (status === "active" || status === "inactive") {
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update. Provide isStock or status.",
      });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = updateStockAndStatus;
