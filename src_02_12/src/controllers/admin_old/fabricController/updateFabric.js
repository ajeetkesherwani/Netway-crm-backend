const Fabric = require("../../../models_old/fabric");

exports.updateFabric = async(req, res) => {
    try {

        const id = req.params.id;
        if(!id) return res.status(500).json({ success: false, message: "id is required" });

        const { fabricName, description, isActive } = req.body;

        const updatedFabric = await Fabric.findById(id);
        if(!updatedFabric) return res.status(400).json({ success: false, message: "Fabric not found" });

        updatedFabric.fabricName = fabricName || updatedFabric.fabricName
        updatedFabric.description = description || updatedFabric.description
        updatedFabric.isActive =isActive || updatedFabric.isActive

        updatedFabric.save();

        return res.status(200).json({ success: true, message: "fabric updated successfully", data: updatedFabric });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}