// utils/sendgrid.js

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarCorreo = async (to, subject, html) => {
  const msg = {
    to, //  destinatario real
    from: process.env.SENDGRID_FROM, 
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("📬 Correo enviado a:", to);
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error.response?.body || error.message);
  }
};

module.exports = enviarCorreo;
