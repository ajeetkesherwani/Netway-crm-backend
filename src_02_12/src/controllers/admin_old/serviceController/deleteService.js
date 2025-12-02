const Service = require("../../../models_old/service");

exports.deleteService = async(req, res) => {
    try {
 
        const id = req.params.id;
        if(!id) return res.status(400).json({ success: false, message: "id is required" });

        const deletedService = await Service.findById(id);
        if(!deletedService){
            return res.status(400).json({ success: false, message: "Service not found" });
        }

        await Service.findByIdAndDelete(id);

        res.status(200).json({ success: false, message: "Service deleted asuccessfully", data: deletedService });
        
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}