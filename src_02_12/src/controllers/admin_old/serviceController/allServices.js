const Service = require("../../../models_old/service");

exports.allServices = async (req, res) => {
    try {

        const allService = await Service.find();
        if (!allService) {
            return res.status(400).json({ success: false, message: "Services not found" });
        }

        return res.status(200).json({ success: true, message: "All Services found", count: allService.length, data: allService });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}