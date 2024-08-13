const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Stock = require("../models/stockModel");
const Returns = require("../models/returnModel");
const Category = require("../models/categorymodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const session = require("express-session");


const loadOrders = async (req,res)=>{ 
    try{
        const user = await req.session.user ;

      const cart = await Cart.findOne({email:user});
      console.log(cart);

      

      const orders = await Orders.find({
        email: user,
        $or: [
          { paymentOption: "cash on delivery" },
          { paymentOption: "wallet payment" ,paymentStatus: 1 },
          { paymentOption: "online payment", paymentStatus: 1 },
        ],
      }).sort({ orderTime: -1 });


        let cartNo = 0;
        if (cart) {
            cartNo = cart.products.length;
            console.log(cartNo);
        }

      const wishList = await WishList.findOne({email:user});

        let wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

      let currentTime = Date.now();

        res. render ("orders",{user,cartNo,orders,currentTime,wishListNo});

    }catch(error){

        console.log(error);
    }
};

const cancelOrder = async (req,res)=>{
    try{
        const id = req.params.id;
        const status = "cancelled"

        const email = req.session.user;

        const order = await Orders.findOne({_id:id });
        const user = await User.findOne({email:email});

        if(user && order && (order.paymentOption=="online payment" || order.paymentOption=="wallet payment")){
            await User.updateOne({email:email},{$set:{wallet:order.purchaseDetails.payAmount}});
        };

        const datenow = new Date(); 
        const options = { 
            
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric'
        };
        
        const date = datenow.toLocaleDateString('en-GB', options);
        
            await Orders.updateOne({_id:id },{$set:{status:status}});

            await  Orders.updateOne({_id:id },{$set:{cancelledDate:date}});

            await Product.updateOne({_id:order.purchaseDetails.productId},{$inc:{salesCount:-order.purchaseDetails.quantity}});

            await Product.updateOne({ _id: order.purchaseDetails.productId }, { $inc: { totalStock:order.purchaseDetails.quantity } });
    
            await Stock.updateOne({ $and: [{productId:order.purchaseDetails.productId},{ productVariant:order.purchaseDetails.size }, { productColor:order.purchaseDetails.color }] },{$inc:{stock:order.purchaseDetails.quantity}});

            

        return res. redirect("/orders");
    }catch(error){
        console.log(error); 
    }
};


const loadOrderManagement = async(req,res)=>{
    try{

        const user = await req.session.user 

      const cart = await Cart.findOne({email:user});

      const orderId = req.query.orderId;
      


      console.log("order id is "+orderId);

      const trimOrderId = orderId.trim();
    
      const order = await Orders.findOne({_id:trimOrderId});

      const product = await Product.findOne({_id:order.productId});


      let cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      console.log(cartNo);
      }

      const wishList = await WishList.findOne({email:user});

        let wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

        return res.render("orderManagement",{user,cartNo,order,product,wishListNo});

    }catch(error){

        console.log(error);

    }
};


const returnOrder = async (req,res)=>{
    try{
        const id = req.params.id;

        const returnReason = req.body.returnReason;

         console.log("it is running"+returnReason);

        console.log("checking.....:",returnReason==="damaged");
        
        const result = await Orders.updateOne({_id:id },{$set:{returnStatus:1}});

        const order = await Orders.findOne({_id:id });

        const datenow = new Date(); 
        const options = { 
            
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric'
        };


        
        const date = datenow.toLocaleDateString('en-GB', options);

        const returns = new Returns ({
            orderId:order._id,
            user:order.email,
            productDetails:`${order.purchaseDetails.productBrand} ${order.purchaseDetails.productName} 
            ${order.purchaseDetails.color} ${order.purchaseDetails.size} (${order.purchaseDetails.quantity})`,
            totalAmount:order.purchaseDetails.payAmount,
            returnReason:req.body.returnReason,
            dateString:datenow,
            returnDate:Date.now(),
          
        });

        await returns.save();

        
        
        return res. redirect("/orders");

    }catch(error){
        console.log(error);
    }
}

module.exports = {
    loadOrders,
    cancelOrder,
    loadOrderManagement,
    returnOrder,
}

