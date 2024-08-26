const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Address = require("../models/addressmodel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const Stock = require("../models/stockModel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const session = require("express-session");


const loadAddress = async(req,res)=>{

  try{
    var errors =[];
    
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
    
    

      const addresses = await Address.find({email:user});

        return res.render("addresses",{errors,addresses,user,cartNo,wishListNo});

    }catch(error){
        console.log(error)
        return res.render("userSideErrors",{user,cartNo,wishListNo})
    }
};


const addAddress = async (req, res) => { 
  try {
      const address = new Address({
          email: req.session.user,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          shippingEmail: req.body.shippingEmail,
          mobile: req.body.mobile,
          country: req.body.country,
          state: req.body.state,
          city: req.body.city,
          street: req.body.street,
          postalCode: req.body.postalCode,
      });

      var errors = [];

      // Validation for first name
      if (!address.firstName.trim()) {
          errors.push({ msg: "First name is required" });
      }

      // Validation for last name
      if (!address.lastName.trim()) {
          errors.push({ msg: "Last name is required" });
      }

      // Email validation
      if (!address.shippingEmail || !validator.isEmail(address.shippingEmail)) {
          errors.push({ msg: "Invalid email address" });
      }

      if (errors.length > 0) {
          const user = req.session.user
          const addresses = await Address.find({ email: user });

          const cart = await Cart.findOne({ email: user });
              let cartNo = 0;
              if (cart) {
                  cartNo = cart.products.length;
              };

              const wishList = await WishList.findOne({email:id});

                var wishListNo = 0;
                if(wishList){
                wishListNo = wishList.products.length;
                }
              const productId = req.params.productId;

          return res.render("addresses", { errors,addresses,user,cartNo,productId,wishListNo});
      } else {
          

          const productId = req.params.productId;
          console.log("second product id is "+ productId);

          const result = await address.save();

          if (productId) {
              // If productId is provided, redirect to checkout page with necessary data
              const user = req.session.user;


              const products = await Product.findOne({ _id: productId });
              const addresses = await Address.find({ email:user });
              const stocks = await Stock.find({ productId: products._id });

              const cart = await Cart.findOne({ email: user });
              let cartNo = 0;
              if (cart) {
                  cartNo = cart.products.length;
              }

              const wishList = await WishList.findOne({email:id});

                var wishListNo = 0;
                if(wishList){
                wishListNo = wishList.products.length;
                }

              return res.render("checkOut", { user, cartNo, products, addresses, stocks,wishListNo  });
          } else {
              // If productId is not provided, render the addresses page with updated address list
              var user = req.session.user
              const addresses = await Address.find({ email: user });

              const cart = await Cart.findOne({ email: user });
              var cartNo = 0;
              if (cart) {
                  cartNo = cart.products.length;
              };

              const wishList = await WishList.findOne({email:user});

                var wishListNo = 0;
                if(wishList){
                wishListNo = wishList.products.length;
                }

              const productId = req.params.productId;
              return res.render("addresses", { errors, addresses, user, cartNo, productId,wishListNo });
          }
      }
  } catch (error) {
      console.log(error);
      return res.render("userSideErrors",{user,cartNo,wishListNo});
  }
};

const addAddressFromCheckout = async(req,res)=>{
    try{

        var user =  req.session.user ;
        var cart = await Cart.findOne({email:user});
    
         var cartNo = 0;
        if(cart){
         cartNo = cart.products.length;
        }
        
        var wishList = await WishList.findOne({email:user});
    
            var wishListNo = 0;
            if(wishList){
            wishListNo = wishList.products.length;
            }
        

        console.log("i am here..");

        const address = new Address({
            email: req.session.user,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            shippingEmail: req.body.shippingEmail,
            mobile: req.body.mobile,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            street: req.body.street,
            postalCode: req.body.postalCode,
        });

        const result = await address.save();

        console.log("address added successfuly..."+address);
       
        const addresses = await Address.find({ email: user });

        res.json( {success:true,addresses });

       

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo})
    }
};

const deleteAddress = async(req,res)=>{
    try{

        var user =  req.session.user ;
        var cart = await Cart.findOne({email:user});
    
         var cartNo = 0;
        if(cart){
         cartNo = cart.products.length;
        }
        
        var wishList = await WishList.findOne({email:user});
    
            var wishListNo = 0;
            if(wishList){
            wishListNo = wishList.products.length;
            }
        

        const addressId = req.query.id;
        console.log("addressId",addressId);

        const result = await Address.deleteOne({_id:addressId});
        console.log("result is ",result);

        res.redirect("/addresses");


    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo})
    }
};


const editAddress = async(req,res)=>{
    try{

        var user =  req.session.user ;
        var cart = await Cart.findOne({email:user});
    
         var cartNo = 0;
        if(cart){
         cartNo = cart.products.length;
        }
        
        var wishList = await WishList.findOne({email:user});
    
            var wishListNo = 0;
            if(wishList){
            wishListNo = wishList.products.length;
            }
        
            
        const addressId = req.query.id;
        console.log("addressId",addressId);

        var preAddress = await Address.findById(addressId);
        console . log ("preAddress",preAddress);

        preAddress. email= req.session.user,
        preAddress.firstName= req.body.firstName,
        preAddress.lastName= req.body.lastName,
        preAddress. shippingEmail= req.body.shippingEmail,
        preAddress. mobile= req.body.mobile,
        preAddress. country= req.body.country,
        preAddress.state= req.body.state,
        preAddress. city= req.body.city,
        preAddress. street= req.body.street,
        preAddress. postalCode= req.body.postalCode,

        await preAddress.save();

        res.redirect("/addresses");

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo})
    }
}

module.exports = {
    loadAddress,
    addAddress,
    addAddressFromCheckout,
    deleteAddress,
    editAddress,
                
                    };