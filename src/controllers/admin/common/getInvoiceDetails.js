const Invoice = require("../../../models/invoice");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { generatePdf } = require("../../../utils/generatePdf");
const numberToWords = require("number-to-words");

exports.getInvoiceDetails = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findById(invoiceId)
    .populate(
      "userId",
      "generalInformation.name generalInformation.username generalInformation.phone generalInformation.email addressDetails.billingAddress"
    )
    .lean();

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  /* ───────── USER DETAILS ───────── */
  const user = invoice.userId?.generalInformation;
  const billing = invoice.userId?.addressDetails?.billingAddress;

  /* ───────── BUILD ADDRESS STRING ───────── */
  const customerAddress = billing
    ? [
        billing.addressline1,
        billing.addressline2,
        billing.city,
        billing.state,
        billing.pincode
      ]
        .filter(Boolean)
        .join(", ")
    : "-";

  /* ───────── TAX CALCULATION ───────── */
  const sgst = invoice.amount * 0.09;
  const cgst = invoice.amount * 0.09;
  const grandTotal = invoice.amount + sgst + cgst;

  const totalInWords =
    numberToWords.toWords(Math.round(grandTotal)) +
    " Rupees Only";

  /* ───────── PDF DATA ───────── */
  const pdfData = {
    logoUrl: "http://localhost:5004/public/logo.png",

    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
    dueDate: new Date(invoice.createdAt).toLocaleDateString(),

    companyName: "Netway Internet Services",
    companyAddress:
      "BRAHAM NIWAS HOSTEL, NEAR RKGIT COLLEGE, MEERUT ROAD, GHAZIABAD, UP - 201001",
    companyGst: "09DAWPS9929D1ZO",

    customerName: user?.name || "-",
    username: user?.username || "-",
    mobile: user?.phone || "-",
    email: user?.email || "-",
    customerAddress, 
    packageName: invoice.packageName,
    period: `${new Date(
      invoice.duration.startDate
    ).toLocaleDateString()} to ${new Date(
      invoice.duration.endDate
    ).toLocaleDateString()}`,

    amount: invoice.amount.toFixed(2),
    sgst: sgst.toFixed(2),
    cgst: cgst.toFixed(2),
    total: grandTotal.toFixed(2),
    totalInWords
  };

  /* ───────── GENERATE PDF ───────── */
  const pdfBuffer = await generatePdf({
    templateName: "invoiceTemplate",
    data: pdfData
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`
  });

  res.send(pdfBuffer);
});
