const generatePdf = require("../../../utils/generatePdf");
const { successResponse } = require("../../../utils/responseHandler");
const UserDueAmount = require("../../../models/userDueAmount");
const AppError = require("../../../utils/AppError");
const cathAsync = require("../../../utils/catchAsync");
 
exports.getPaymentHistoryPdf = cathAsync(async (req, res) => {
   
     
        const userId = req.user.id;
 
        const user = await UserDueAmount.findById(userId);
       
        console.log("user", userdetails);
        if (!user) {
            return next(new AppError("User not found", 404));
        }
 
        // Prepare dynamic PDF data
        const data = {
            logoUrl: user.logoUrl,
            title: "My Profile Report",
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            date: new Date().toLocaleDateString(),
            refNo: "REF-" + Date.now()
        };
 
        // Generate PDF buffer
        const pdf = await generatePdf(data);
 
        // Send PDF
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=my-details.pdf"
        });
 
        res.send(pdf);
 
        return successResponse(res, "PDF generated successfully", pdf);
});
