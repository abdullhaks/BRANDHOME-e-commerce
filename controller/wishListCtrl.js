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

      let cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      };

        const wishList = await WishList.findOne({email:id});
        console.log(wishList);

        let wishListNo = 0;
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
    }
}



const addtoWishList = async(req,res)=>{
    try{

            const productId = req.query.productId;
            console.log("wish produt id is"+productId);

            const user = req.session.user;
            console.log(user);

            const wishList =  await WishList.findOne({email:user});

           if( wishList && wishList.products.includes (productId)){
            return res.redirect("/wishList");
           }else{

            const result = await WishList.updateOne({email:user},{$push : {products:productId}},{upsert:true});

            console.log(result);

            return res.redirect("/wishList");
           }

           
            //const products = await Product.find().limit(16).skip(0);
            //console.log(products)

            //res.render("products",{user,products})
            

    }catch(error){
        console.log(error);
    }
};

const removeFromWishList = async(req,res)=>{
    try{

        const productId = req.query.productId;
        console.log(productId);

        const user = req.session.user;
        console.log(user);

        const result = await WishList.updateOne({email:user},{$pull : {products:productId}});

        res.redirect("/wishList");

    }catch(error){
        console.log(error);
    }
}

module.exports = {
    addtoWishList,
    loadWishList,
    removeFromWishList,
}