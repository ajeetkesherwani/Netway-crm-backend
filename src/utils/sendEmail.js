const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or use "SendGrid", "Mailgun", or custom SMTP
    auth: {
      user: process.env.EMAIL_USER, // your email address
      pass: process.env.EMAIL_PASS, // app password or real password
    },
  });

  console.log("process.env.EMAIL_USER",process.env.EMAIL_USER);
  console.log("process.env.EMAIL_PASS",process.env.EMAIL_PASS);
  console.log("html",html);
  // Define mail options
  const mailOptions = {
    from: `"Netway Internet" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECIVER,
    subject,
    text: message, // plain text body
    html: html || `<p>${message}</p>`, // optional HTML body
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
