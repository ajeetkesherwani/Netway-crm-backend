// const Package = require("../../../models/package"); // Adjust the path according to your model location

// const getPackages = async (req, res) => {
//   try {
//     const packages = await Package.find().select("name type price validityInDays billingType speed isActive isFeatured").sort({ createdAt: -1 }).lean();
//     res.status(200).json({ success: true,message:"Package data fetched successfully!", data: packages });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching packages", error: error.message });
//   }
// };

// const getPackageById = async (req, res) => {
//   try {
//     const package = await Package.findById(req.params.id);
//     if (!package) {
//       return res.status(404).json({ success: false, message: "Package not found" });
//     }
//     res.status(200).json({ success: true, data: package });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching package", error: error.message });
//   }
// };

// const updatePackage = async (req, res) => {
//   try {
//     const updatedPackage = await Package.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedPackage) {
//       return res.status(404).json({ success: false, message: "Package not found" });
//     }
    
//     res.status(200).json({ success: true, data: updatedPackage });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating package", error: error.message });
//   }
// };
// const togglePackageStatus = async (req, res) => {
//   try {
//     const package = await Package.findById(req.params.id);
    
//     if (!package) {
//       return res.status(404).json({
//         success: false,
//         message: "Package not found"
//       });
//     }

//     // Toggle the status
//     package.isActive = !package.isActive;
//     await package.save();

//     res.status(200).json({
//       success: true,
//       message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`,
//       data: package
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error toggling package status",
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getPackages,
//   getPackageById,
//   updatePackage,
//   togglePackageStatus
// };