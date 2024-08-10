const User = require("../models/userModel"); 
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Sales = require("../models/salesModel");
const Stock = require("../models/stockModel");
const Returns = require("../models/returnModel");
const Category = require("../models/categorymodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail");


const loadAdminOrderManagement = async(req,res)=>{

    try{

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 7; // Number of products per page

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);

        const orders = await Orders.find({$or:[{paymentOption:"cash on delivery"},
                                                {paymentOption:"wallet payment"},
                                                {$and:[{paymentOption:"online payment"},{paymentStatus:1}]}]})
        .sort({orderTime:-1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);


        

        res.render("adminOrderManagement",{orders, currentPage:page, totalPages});


    }catch(error){
        console.log(error);
    }
};



const updateOrderStatus = async (req,res)=>{
    try{

        var orderId = req.body.orderId; 
        var newStatus = req.body.newStatus; 

        console.log("new status is "+newStatus);

        const order = await Orders.findOne({_id:orderId });


        const datenow = new Date(); 
        const options = { 
            
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric'
        };
        
        const date = datenow.toLocaleDateString('en-GB', options); 

        if(newStatus=="dispatched"){

            const result = await Orders.updateOne({_id:orderId },{$set:{status:newStatus}});
            await  Orders.updateOne({_id:orderId },{$set:{dispatchedDate:date}});
        console.log ('Order status updated successfully');

        };

        if(newStatus=="pending"){

            const result = await Orders.updateOne({_id:orderId },{$set:{status:newStatus}});
            
        console.log ('Order status updated successfully');

        };

        if(newStatus=="delivered"){ 

            console.log("it is delivered");

            

           const exp= Date.now() + (259200 * 1000);
            const result = await Orders.updateOne({_id:orderId },{$set:{status:newStatus}});
            await  Orders.updateOne({_id:orderId },{$set:{deliveredDate:date}});
            await  Orders.updateOne({_id:orderId },{$set:{returnCanceledOn:exp}});
            await  Orders.updateOne({_id:orderId },{$set:{paymentStatus:1}});

            const order = await Orders.findOne({ _id:orderId});
            console.log("order is ",order);

            var dat = new Date();
            
            const sale = new Sales (
              {
                orderObjectId:order._id,
                email:order.email,
                orderId:order.orderId,
                purchaseDetails:order.purchaseDetails,
                address:order.address ,
                paymentOption:order.paymentOption,
                paymentStatus:order.paymentStatus ,
                transactionId:order.transactionId,
                orderDate:order.orderDate,
                orderTime:order.orderTime,
                dispatchedDate:order.dispatchedDate,
                deliveredDate:new Date(),
                deliverTime:dat.getTime(),
                status:order.status,
                returnStatus:order.returnStatus,
           
               
              }
            );

            console.log("sale is ",sale);
            const saleResult = await sale.save();
            console.log("sale result is ",saleResult);

          

            

        console.log ('Order status updated successfully');

        };


         if(newStatus==="cancelled"){

            const result = await Orders.updateOne({_id:orderId },{$set:{status:newStatus}});
            await  Orders.updateOne({_id:orderId },{$set:{cancelledDate:date}});

            await Product.updateOne({_id:order.productId},{$inc:{salesCount:-order.quantity}});

            await Product.updateOne({ _id: order.productId }, { $inc: { totalStock:order.quantity } });
    
            await Stock.updateOne({ $and: [{productId:order.productId},{ productVariant:order.option }, { productColor:order.color }] },{$inc:{stock:order.quantity}});

        console.log ('Order status updated successfully');

        };



    }catch(error){
        console.log(error);
    }
}

module.exports = {
    loadAdminOrderManagement,
    updateOrderStatus,
}