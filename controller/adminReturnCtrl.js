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
      .sort({ requestDate: -1 })
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
    var newStatus = req.body.newStatus; 
    var returnId = req.body.returnId;

    var returnItem =await Returns.findOne({_id:returnId});
    // var order = await Orders.findOne({orderId:returnItem.orderId});

    console.log("new return  is " + returnItem);
    // console.log("new oder  is " + order);

    if (newStatus == "pending") {

        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        // const order = await Orders.updateOne({orderId:returnItem.orderId},{$set:{returnStatus:1}});

        const updateResult = await Orders.updateOne(
          { orderId: returnItem.orderId },
          {
              $set: {
                  [`items.${returnItem.index}.returnStatus`]: 1,
              }
          }
          );

    }

    if (newStatus == "approved") {
    

      if(returnItem.returnReason==="damaged"){
       
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        // await Orders.updateOne({_id:orderId},{$set:{returnStatus:2}});

        const updateResult = await Orders.updateOne(
          { orderId: returnItem.orderId },
          {
              $set: {
                  [`items.${returnItem.index}.returnStatus`]: 2,
                  [`items.${returnItem.index}.returnedOn`]: new Date(),
              }
          }
          );
        
        await Product.updateOne({_id:returnItem.item.productId},{$inc:{salesCount:-returnItem.item.quantity}});

        await Sales.deleteOne({_id:returnItem.item.salesId});

        await User.updateOne({email:returnItem.user},{$inc:{wallet:returnItem.item.payAmount}});
       
      }else{



        
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        // await Orders.updateOne({_id:orderId},{$set:{returnStatus:2}});
        
       
        const updateResult = await Orders.updateOne(
          { orderId: returnItem.orderId },
          {
              $set: {
                  [`items.${returnItem.index}.returnStatus`]: 2,
                  [`items.${returnItem.index}.returnedOn`]: new Date(),
              }
          }
          );

        await Product.updateOne({_id:returnItem.item.productId},{$inc:{salesCount:-returnItem.item.quantity}});

        await Product.updateOne({ _id: returnItem.item.productId }, { $inc: { totalStock:returnItem.item.quantity } });

        await Stock.updateOne({ $and: [{productId:returnItem.item.productId},{ productVariant:returnItem.item.size }, { productColor:order.returnItem.color }] },{$inc:{stock:returnItem.item.quantity}});
        
        await Sales.deleteOne({_id:returnItem.item.orderId});

        await User.updateOne({email:returnItem.user},{$inc:{wallet:returnItem.item.payAmount}});
      }
    
           

    }

    if (newStatus == "declined") {
        const returns =await Returns.updateOne({_id:returnId},{$set:{returnStatus:newStatus}});
        // const order = await Orders.updateOne({_id:orderId},{$set:{returnStatus:3}});

        const updateResult = await Orders.updateOne(
          { orderId: returnItem.orderId },
          {
              $set: {
                  [`items.${returnItem.index}.returnStatus`]: 3,
                  [`items.${returnItem.index}.returDeclinedOn`]: new Date(),
              }
          }
          );
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
