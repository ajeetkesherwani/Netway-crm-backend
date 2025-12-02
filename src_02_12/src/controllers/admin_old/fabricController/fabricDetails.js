const Fabric = require("../../../models_old/fabric");

exports.fabricDetail = async(req, res) => {
    try {

        const id = req.params.id;
        if(!id) return res.status(400).json({ success: false, message: "id is required" });

        const fabricInDetail = await Fabric.findOne({ _id: id });
        if(!fabricInDetail){
            return res.status(400).json({ success: false, message: "Fabric not found" });
        }

        res.status(200).json({ success: false, message: "Fabric found", data: fabricInDetail });
        
    } catch (error) {
       return res.status(500).json({ success: false, message: error.message }); 
    }
} 