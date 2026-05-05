const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "valerasoftwares@gmail.com",
    pass: "your-email-password",
  },
});

const mailOptions = {
  from: "your-email@gmail.com",
  to: "recipient-email@gmail.com",
  subject: "Cypress Test Report",
};

const reportPath = path.join(__dirname, "cypress/reports/simpleReport.html");

fs.readFile(reportPath, "utf8", (err, data) => {
  if (err) throw err;

  mailOptions.html = data;

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
});
