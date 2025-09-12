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

  // Define mail options
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message, // plain text body
    html: html || `<p>${message}</p>`, // optional HTML body
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
