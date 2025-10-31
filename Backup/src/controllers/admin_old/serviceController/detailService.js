const Service = require("../../../models_old/service");

exports.detailService = async(req, res) => {
    try {

        const id = req.params.id;
        if(!id) return res.status(400).json({ success: false, message: "id is required" });

        const serviceInDetails = await Service.findById(id);
        if(!serviceInDetails){
            return res.status(400).json({ success: false, message: "service not found" });
        }

        res.status(200).json({ success: true, message: "Service in details", data: serviceInDetails });

        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}