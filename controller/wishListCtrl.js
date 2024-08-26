const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const session = require("express-session");


const loadWishList = async(req,res)=>{
    try{ 
 
        const products= []; 


        const id = await req.session.user 

        const cart = await Cart.findOne({email:id});

      var cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      };

        const wishList = await WishList.findOne({email:id});
        console.log(wishList);

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        console.log(wishListNo);
        }
      
  
        for(let i = 0 ; i<wishListNo ; i++){

            var singleProduct = ""

            singleProduct = await Product.findOne({$and:[{_id:wishList.products[i]},{unList:0}]});

            if(singleProduct){
                products.push(singleProduct);
            };
           
        }
         console .log("products are "+products);
        return  res.render("wishlist",{products,user:id,wishListNo,cartNo});
    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user:id,cartNo,wishListNo});
    }
}



const addtoWishList = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.session.user;

        // Find the user's wishlist
        let wishList = await WishList.findOne({ email: user });
        let cart = await Cart.findOne({ email: user });

        // Check if the product is already in the wishlist
        if (wishList && wishList.products.includes(productId)) {
            return res.json({ success: true, msg: "already added", wishCount: wishList.products.length });
        }

        if (cart && cart.products.includes(productId)) {
            return res.json({ success: true, msg: "item already in cart" });
        }

        // Add the product to the wishlist
        await WishList.updateOne({ email: user }, { $push: { products: productId } }, { upsert: true });

        // Get the updated wishlist count
        wishList = await WishList.findOne({ email: user });
        let wishCount = wishList ? wishList.products.length : 0;

        res.json({ success: true, msg: "added to wishlist", wishCount });
    } catch (error) {
        res.json({ success: false, msg: "something went wrong" });
        console.log(error);
    }
};


const removeFromWishList = async(req,res)=>{
    try{

        const productId = req.query.productId;
        console.log(productId);

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
        console.log(user);

        const result = await WishList.updateOne({email:user},{$pull : {products:productId}});

        res.redirect("/wishList");

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo});
    }
}

module.exports = {
    addtoWishList,
    loadWishList,
    removeFromWishList,
}