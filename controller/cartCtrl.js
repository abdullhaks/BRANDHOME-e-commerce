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
        const variants=[];


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
                variants.push(cart.products[i]);
            };
           
        }
         console .log("products are ",products);
         console .log("variants are ",variants);

        return  res.render("cart",{products,variants,user:id,cartNo,wishListNo});
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

const removeFromCart = async (req, res) => {
    try {
        const { productId, color, size } = req.query;
        const userId = req.session.user;

        const result = await Cart.updateOne(
            { email: userId },
            { $pull: { products: { productId, color, size } } }
        );

        if (result.modifiedCount > 0) {
            const cart = await Cart.findOne({ email: userId });
            const products = [];
            const variants = [];

            for (const item of cart.products) {
                const singleProduct = await Product.findOne({ _id: item.productId, unList: 0 });

                if (singleProduct) {
                    products.push(singleProduct);
                    variants.push(item);
                }
            }

            res.json({ success: true, products, variants });
        } else {
            res.status(400).json({ error: 'Product not found in cart' });
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




module.exports = {
    addtoCart,
    loadCart,
    removeFromCart,
    addtoCartFromWishlist,
}