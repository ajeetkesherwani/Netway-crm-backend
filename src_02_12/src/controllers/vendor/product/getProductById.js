const ProductModel = require("../../../models/products");

const getProductById = async (req, res) => {
    try {
        // const product = await ProductModel.findById(req.params.id).populate('category fabric vendor');
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = getProductById;