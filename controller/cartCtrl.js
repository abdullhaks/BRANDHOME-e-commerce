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


const loadCart = async(req,res)=>{
    try{

        const products= []; 


        const id = await req.session.user 

        const cart = await Cart.findOne({email:id});
        console.log(cart);

        let cartNo = 0;
        if(cart){
         cartNo = cart.products.length;
        console.log(cartNo);
        }

        const wishList = await WishList.findOne({email:id});

        let wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }
      
  
        for(let i = 0 ; i<cartNo ; i++){

            var singleProduct = ""

            singleProduct = await Product.findOne({$and:[{_id:cart.products[i]},{unList:0}]});

            if(singleProduct){
                products.push(singleProduct);
            };
           
        }
         console .log("products are "+products);
        return  res.render("cart",{products,user:id,cartNo,wishListNo});
    }catch(error){
        console.log(error);
    }
}



const addtoCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.session.user;

        // Find the user's cart
        let cart = await Cart.findOne({ email: user });

        // Check if the product is already in the cart
        if (cart && cart.products.includes(productId)) {
            return res.json({ success: true, msg: "already added" });
        }

        // Add the product to the cart
        await Cart.updateOne({ email: user }, { $push: { products: productId } }, { upsert: true });

        // Remove the product from the wishlist
        await WishList.updateOne({ email: user }, { $pull: { products: productId } });

        // Get the updated counts
        let wishList = await WishList.findOne({ email: user });
        let wishCount = wishList ? wishList.products.length : 0;

        cart = await Cart.findOne({ email: user });
        let cartCount = cart ? cart.products.length : 0;

        res.json({ success: true, msg: "added to cart", wishCount, cartCount });
    } catch (error) {
        res.json({ success: false, msg: "something went wrong" });
        console.log(error);
    }
};


const removeFromCart = async(req,res)=>{
    try{

        const productId = req.query.productId;
        console.log(productId);

        const user = req.session.user;
        console.log(user);

        const result = await Cart.updateOne({email:user},{$pull : {products:productId}});

        res.redirect("/cart");

    }catch(error){
        console.log(error);
    }
};


const addtoCartFromWishlist = async (req, res) => {
    try {
        console.log("addtoCartFromWishlist is working now.....");
        const { productId } = req.body;
        const user = req.session.user;

        console.log("product id is ", productId);
        console.log("user is ", user);

        // Find the user's cart
        let cart = await Cart.findOne({ email: user });

        // Check if the product is already in the cart
        if (cart && cart.products.includes(productId)) {
            return res.json({ success: true, msg: "Product already added to the cart" });
        }

        // Add the product to the cart
        await Cart.updateOne({ email: user }, { $push: { products: productId } }, { upsert: true });

        // Remove the product from the wishlist
        await WishList.updateOne({ email: user }, { $pull: { products: productId } });

        // Get the updated wishlist and cart counts
        const wishList = await WishList.findOne({ email: user });
        const wishCount = wishList ? wishList.products.length : 0;

        const products = [];
        if (wishCount > 0) {
            for (let i = 0; i < wishList.products.length; i++) {
                const item = await Product.findById(wishList.products[i]);
                products.push(item);
            }
        }

        cart = await Cart.findOne({ email: user });
        const cartCount = cart ? cart.products.length : 0;

        res.json({ success: true, msg: "Product moved to cart", wishCount, cartCount, products });
    } catch (error) {
        res.json({ success: false, msg: "Something went wrong" });
        console.error(error);
    }
};


module.exports = {
    addtoCart,
    loadCart,
    removeFromCart,
    addtoCartFromWishlist,
}