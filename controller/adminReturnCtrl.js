const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Returns = require("../models/returnModel");
const Stock = require("../models/stockModel");
const Sales = require("../models/salesModel")
const Category = require("../models/categorymodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail");



const loadAdminReturnManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const pageSize = 7; // Number of products per page

    const totalReturns = await Returns.countDocuments();
    const totalPages = Math.ceil(totalReturns / pageSize);

    const returns = await Returns.find()
      .sort({ returnDate: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    res.render("adminReturnManagement", {
      returns,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.render("adminSideErrors");
  }
};



const updateReturnStatus = async (req, res) => {
  try {
    var orderId = req.body.orderId; // Accessing the order ID from the request body
    var newStatus = req.body.newStatus; // Accessing the new status from the request body
    var returnId = req.body.returnId;

    var returnItem =await Returns.findOne({_id:returnId});
    var order = await Orders.findOne({_id:orderId});

    

    console.log("new return  is " + returnItem);
    console.log("new oder  is " + order);


    const datenow = new Date();
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    };

    const date = datenow.toLocaleDateString("en-GB", options);

    if (newStatus == "pending") {
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        const order = await Orders.updateOne({_id:orderId},{$set:{returnStatus:1}});

    }

    if (newStatus == "approved") {
    

      if(returnItem.returnReason==="damaged"){
       
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        await Orders.updateOne({_id:orderId},{$set:{returnStatus:2}});
        
        await Product.updateOne({_id:order.purchaseDetails.productId},{$inc:{salesCount:-order.purchaseDetails.quantity}});

        await Sales.deleteOne({orderObjectId:returnItem.orderId});

        await User.updateOne({email:order.email},{$inc:{wallet:order.purchaseDetails.payAmount}});
       
      }else{



        
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        await Orders.updateOne({_id:orderId},{$set:{returnStatus:2}});
        
       

        await Product.updateOne({_id:order.purchaseDetails.productId},{$inc:{salesCount:-order.purchaseDetails.quantity}});

        await Product.updateOne({ _id: order.purchaseDetails.productId }, { $inc: { totalStock:order.purchaseDetails.quantity } });

        await Stock.updateOne({ $and: [{productId:order.purchaseDetails.productId},{ productVariant:order.purchaseDetails.size }, { productColor:order.purchaseDetails.color }] },{$inc:{stock:order.purchaseDetails.quantity}});
        
        await Sales.deleteOne({orderObjectId:returnItem.orderId});

        await User.updateOne({email:order.email},{$inc:{wallet:order.purchaseDetails.payAmount}});
      }
    
           

    }

    if (newStatus == "declined") {
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        const order = await Orders.updateOne({_id:orderId},{$set:{returnStatus:3}});
    }
  } catch (error) {
    console.log(error);
    res.render("adminSideErrors");
  }
};

module.exports = {
  loadAdminReturnManagement,
  updateReturnStatus,
};
