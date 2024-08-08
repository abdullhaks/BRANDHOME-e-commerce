
const nodemailer = require("nodemailer");

async function sendMail(mailOptions) {
    const transporter = nodemailer.createTransport({
      service:"gmail",
      auth:{
        user:"muthuab786@gmail.com",
        pass:"jwkphrnhcasuprph"
        
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