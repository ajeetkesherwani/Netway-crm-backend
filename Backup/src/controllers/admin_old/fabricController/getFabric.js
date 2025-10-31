const Fabric = require("../../../models_old/fabric");
const paginate = require("../../../utils/paginate");

exports.getAllFabric = async (req, res) => {
    try {

        // const allFabric = await Fabric.find();

        const { page, limit } = req.query;

        const allFabric = await paginate(Fabric, {},{
            page,
            limit,
            sort:{ createdAt: -1 }
        });

        if (!allFabric || allFabric.paginateData.length === 0) {
            return res.status(400).json({ success: false, message: "fabric not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "all fabric found", 
            count: allFabric.paginateData.length, 
            data: allFabric
         });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}