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

            singleProduct = await Product.findOne({$and:[{_id:cart.products[i].productId},{unList:0}]});

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
        const { productId, color, size } = req.body;
        console.log(productId, color, size);

        const user = req.session.user;
        console.log(user);

    
        const cart = await Cart.findOne({ email: user });
        console.log("cart is ", cart);

        if (cart) {
            // Check if product in the cart..
            const productExists = cart.products.some(product => 
                product.productId === productId && 
                product.color === color && 
                product.size === size
            );

          

            if (productExists) {
                return res.json({ success: false, msg: "Product already added" });
            }
        }

        // item to add
        const newProduct = {
            productId: productId,
            color: color,
            size: size
        };

        // new product to cart..
        const result = await Cart.updateOne(
            { email: user },
            { $push: { products: newProduct } },
            { upsert: true }
        );

        console.log(result);

        // removing product frim the cart..
        await WishList.updateOne({ email: user }, { $pull: { products: productId } });

        console.log("Removed from wishlist..");

        console.log(await Cart.findOne({ email: user }));

        return res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: "Server error" });
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
}

module.exports = {
    addtoCart,
    loadCart,
    removeFromCart,
}