const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const sendEmail = require("../../../utils/sendEmail");

exports.getUserList = catchAsync(async(req, res, next) => {

    const username = 'JohnDoe';
    const emailSubject = `Welcome User!`;
    const emailText = `Hi User,\n\nThank you for signing up! We're glad to have you on board.`;

    // Call sendEmail with the correct object structure
    sendEmail({
        email: 'kesherwaniajeet@gmail.com',  // The recipient's email
        subject: emailSubject,               // The subject of the email
        message: emailText,                  // The plain text message
        html: `<p>${emailText}</p>`          // HTML body for email (optional)
    });
    const user = await User.find();
    if(!user) return next(new AppError("user not found",404));

    successResponse(res, "user found successfully", user);

});