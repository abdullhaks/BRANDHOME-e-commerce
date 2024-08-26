const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");



const securePassword = async(password)=>{

    try{
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};


const checkRecoveryPassword = async (req,res)=>{
  try {

    var errors = [];
   const otp = req.body.otp;
   const email = req.body.data;
   
    console.log(email)
    
    var id =  req.session.user ;
    const cart = await Cart.findOne({email:id});

     var cartNo = 0;
    if(cart){
     cartNo = cart.products.length;
    }

    const wishList = await WishList.findOne({email:id});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }
  

      const user = await Recoverypassword.findOne({ email: email }).sort({ createdAt: -1 }).limit(1);;
      

      if(user){
        if(user.otp==otp){
          
          return res.render("newPassword",{email,errors})
        }else{
          errors.push({ msg: "incorrect password " });
          res.render("recoveryPassword",{errors,email});
        }
      }
    } catch (error) {
      console.log(error);
      return res.render("userSideErrors",{user:id,cartNo,wishListNo});
    }
  
  
  
  
  };
  
  const resentRecoveryPassword = async(req,res)=>{

    try{

      var id =  req.session.user ;
      const cart = await Cart.findOne({email:id});
  
       var cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      }
  
      const wishList = await WishList.findOne({email:id});
  
          var wishListNo = 0;
          if(wishList){
          wishListNo = wishList.products.length;
          }
      const email = req.params.email;
  
      console.log("resend recovery password is "+email)
    
      const OTP = otpGenerator.generate(8, {  specialChars: false });
    
      const recoverypassword = new Recoverypassword ({
        email:email,
        otp:OTP
    
      });
    
      const recoveryPasswordResult = await recoverypassword.save();
    
     
      var errors = [];
      const mailOptions = {
        from:"muthuab786@gmail.com",
        to:email,
        subject:"WELCOME TO BRANDHOME... ",
        text:"Hi, This is your OTP : "+recoverypassword.otp
    
      }
    
      mail.sendMail(mailOptions);
      const user = await User.findOne({ email: email })
      return  res.render("recoveryPassword",{errors,user});
    
    }catch(error){
      console.log(error);
      return res.render("userSideErrors",{user:id,cartNo,wishListNo});
    }
    
  };

  const verifyNewPassword = async (req,res)=>{
    try{

      var user =  req.session.user ;
      const cart = await Cart.findOne({email:user});
  
       var cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      }
  
      const wishList = await WishList.findOne({email:user});
  
          var wishListNo = 0;
          if(wishList){
          wishListNo = wishList.products.length;
          }
          
        const password= req.body.password;
        const confirmPassword= req.body.confirmPassword;
        const email = req.body.email;
        var errors = [];


        if (!password) {
            errors.push({ msg: "Password is required  " });
          } else if (password.length < 6) {
            errors.push({ msg: "Password should be at least 6 characters  " });
          }
        
          // Confirm password validation
          if (!confirmPassword) {
            errors.push({ msg: "Confirm password is required  " });
          } else if (confirmPassword !== password) {
            errors.push({ msg: "Passwords do not match  " });
          }


          if (errors.length > 0) {
            // If yes, render the signup form again with the errors and the user input
            res.render("newPassword", {errors,email});
          }else{

            const spassword = await securePassword(password);
            
            const sCONFpassword = await securePassword(confirmPassword);

            const result = await User.updateOne({email:email},{$set:{password:spassword}});

            return  res.redirect("/home");

          }


    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo});
    }
  }



  module.exports = {
    checkRecoveryPassword,
    resentRecoveryPassword,
    verifyNewPassword }
  