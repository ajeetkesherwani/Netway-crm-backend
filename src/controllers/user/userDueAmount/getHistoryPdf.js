// const  { generatePdf } = require("../../../utils/generatePdf");
// const UserDueAmount = require("../../../models/userDueAmount");
// const AppError = require("../../../utils/AppError");
// const cathAsync = require("../../../utils/catchAsync");
// const fs = require("fs");
// const path = require("path");

// exports.getPaymentHistoryPdf = cathAsync(async (req, res, next) => {

//     const userId = req.user.id;

//     const user = await UserDueAmount.findOne({ userId })
//      .populate("userId", "generalInformation.name generalInformation.username");;
//     if (!user) {
//         return next(new AppError("User not found", 404));
//     }

//     // Load logo
//     const logoPath = path.join(process.cwd(), "public", "logo.png");
//     const logoBase64 = fs.readFileSync(logoPath, "base64");

//     // build dynamic values
//     const data = {
//         logoUrl: `data:image/png;base64,${logoBase64}`,
//         refNo: "REF-" + Date.now(),
//         name: user.userId.generalInformation.name,
//         username: user.userId.generalInformation.username,
//         modeOfPayment: user.modefPayment,
//         status: user.status,
//         amount: user.dueAmount,
//         date: new Date(user.createdAt).toLocaleDateString("en-GB"), // 27-11-2023
//         title: "Payment Receipt"
//     };

//     const pdf = await generatePdf(data);

//     res.set({
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "attachment; filename=receipt.pdf"
//     });

//     return res.send(pdf);
// });

const { generatePdf } = require("../../../utils/generatePdf");
const UserDueAmount = require("../../../models/userDueAmount");
const AppError = require("../../../utils/AppError");
const cathAsync = require("../../../utils/catchAsync");
const fs = require("fs");
const path = require("path");

exports.getPaymentHistoryPdf = cathAsync(async (req, res, next) => {

    const paymentId = req.params.paymentId;
    const loggedUserId = req.user.id;

    // Find selected payment with user details
    const payment = await UserDueAmount.findOne({
        _id: paymentId,
        userId: loggedUserId
    }).populate("userId", "generalInformation.name generalInformation.username");

    if (!payment) {
        return next(new AppError("Payment record not found", 404));
    }

    // Load logo
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBase64 = fs.readFileSync(logoPath, "base64");

    // Build dynamic PDF data
    const data = {
        logoUrl: `data:image/png;base64,${logoBase64}`,
        title: "Payment Receipt",

        // Receipt No based on payment ID
        refNo: payment.receiptNo,

        // Customer Details
        name: payment.userId.generalInformation.name,
        username: payment.userId.generalInformation.username,

        // Payment Details
        modeOfPayment: payment.modefPayment,
        status: payment.status,
        amount: payment.dueAmount,
        date: new Date(payment.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    // const pdf = await generatePdf(data);
    const pdf = await generatePdf({
      templateName: "invoiceTemplate",
      data: data
    });

    // PDF Response
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${data.refNo}.pdf`
    });

    return res.send(pdf);
});
