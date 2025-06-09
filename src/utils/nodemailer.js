console.log("🔍 HOST:", process.env.EMAIL_HOST);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Hotel Suspiro" <no-reply@suspiroHotel.com>`,
    to,
    subject,
    html,
  });
};
