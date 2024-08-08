
const Otp = require("../models/otpmodel");
const Address = require("../models/addressmodel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const User = require("../models/userModel");
const Stock = require("../models/stockModel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const session = require("express-session");

const loadProfile = async ( req , res )=>{
    try{


    
        var user =  req.session.user ;

        const profile = await User.findOne({ email:user});
        console.log("profile is "+profile);
    
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
    
            return res.render("profile",{user,profile,cartNo,wishListNo});



    }catch(error){
        console.log(error);
    }
};

module.exports = {
    loadProfile,
    
}