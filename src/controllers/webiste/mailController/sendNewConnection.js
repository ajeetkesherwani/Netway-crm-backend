const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const sendEmail = require("../../../utils/sendEmail");

exports.sendNewConnection = catchAsync(async (req, res, next) => {

    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new AppError("Request body is empty", 400));
    }
    const { name, mobile, city, locality } = req.body;

    if (!name) return next(new AppError("name is required", 400));
    if (!mobile) return next(new AppError("mobile is required", 400));
    if (!city) return next(new AppError("city is required", 400));
    if (!locality) return next(new AppError("locality is required", 400));

    const emailSubject = `Website New Connection Request!`;
    const emailText = `
        Customer Name: ${name}<br>
        Customer Mobile: ${mobile}<br>
        City: ${city}<br>
        Locality: ${locality}<br>
    `;

    try {
        await sendEmail({
            email: 'kesherwaniajeet@gmail.com', 
            subject: emailSubject,              
            message: emailText,                 
            html: `<p>${emailText}</p>`         
        });

        successResponse(res, "New connection request sent successfully!", "");

    } catch (error) {
        console.error("Error sending email:", error);
        return next(new AppError("Failed to send email", 500));
    }
});
