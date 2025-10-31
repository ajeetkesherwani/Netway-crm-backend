const Fabric = require("../../../models_old/fabric");

exports.createFabric = async (req, res) => {
    try {

        const { fabricName, description, isActive } = req.body;

        if (!fabricName) return res.status(400).json({ success: false, message: "fabricName is required" });
        if (!description) return res.status(400).json({ success: false, message: "description is required" });

        const newFabric = new Fabric({ fabricName, description, isActive });

        await newFabric.save();

        res.status(200).json({ success: true, message: "fabric addedd successfully", data: newFabric })


    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}