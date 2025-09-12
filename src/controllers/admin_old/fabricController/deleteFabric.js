const Fabric = require("../../../models_old/fabric");

exports.deleteFabric = async(req, res) => {
    try {

        const id = req.params.id;
        if(!id) return res.status(400).json({ success: false, message: "Fabric id is required" });

        const deletedFabric = await Fabric.findById(id);
        if(!deletedFabric) return res.status(400).json({ success: false, message: "fabric not found" });

        await Fabric.findByIdAndDelete(id);

        return res.status(200).json({ success: false, message: "Fabric deleted successfully", data: deletedFabric });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}