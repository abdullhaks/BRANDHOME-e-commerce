
const nodemailer = require("nodemailer");

async function sendMail(mailOptions) {


  let mail =  process.env.SMTP_MAIL;
  let pass = process.env.SMTP_PASSWORD;
    // const transporter = nodemailer.createTransport({
    //   service:"gmail",
    //   auth:{
    //     user:"muthuab786@gmail.com",
    //     pass:"jwkphrnhcasuprph"
        
    //   }
    // });


  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: `${mail}`,
    pass: `${pass}`
  },
  tls: {
    rejectUnauthorized: false
  }
});

   

    try {
      const mailResult = await transporter.sendMail(mailOptions)
      console.log("mail successfully send..")
      
    } catch (error) {
      console.log(error);
      
    }


  }

  module.exports = {sendMail}