const nodemailer = require("nodemailer");

async function sendMail(mailOptions) {
  // const transporter = nodemailer.createTransport({
  //   service:"",
  //   auth:{
  //     user:"",
  //     pass:""

  //   }
  // });

  const transporter = nodemailer.createTransport({
    host: `${process.env.SMTP_HOST}`,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: `${process.env.SMTP_MAIL}`,
      pass: `${process.env.SMTP_PASSWORD}`,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const mailResult = await transporter.sendMail(mailOptions);
    console.log("mail successfully send..");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendMail };
