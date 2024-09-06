const User = require("../models/userModel"); 
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Sales = require("../models/salesModel");
const Stock = require("../models/stockModel");
const Wallet = require("../models/walletModel");
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

        const orders = await Orders.find({$or:[ {paymentOption:"cash on delivery"},
                                                {$and:[{paymentOption:"wallet payment"},{paymentStatus:1}]},
                                                {$and:[{paymentOption:"online payment"},{paymentStatus:1}]}]})
        .sort({orderDate:-1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);


        

        res.render("adminOrderManagement",{orders, currentPage:page, totalPages});


    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};



const updateOrderStatus = async (req, res) => {
    try {

        var orderId = req.body.orderId;
        var index = req.body.index;
        var newStatus = req.body.newStatus;

        console.log("new status is " + newStatus);

        var order = await Orders.findOne({ _id: orderId });
        console.log("order is ", order);
        var product = await Product.findById(order.items[index].productId);
        console.log("product is .....",product);

        if (!order) {
            console.log("Order not found");
            return res.render("adminSideErrors");
        }

        if (order) {
           

            if (newStatus == "dispatched") {

                // const result = await Orders.updateOne({ _id: orderId }, { $set: { status: newStatus } });
                // await Orders.updateOne({ _id: orderId }, { $set: { dispatchedDate: date } });


                const updateResult = await Orders.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [`items.${index}.status`]: newStatus,
                            [`items.${index}.dispatchedDate`]: new Date()
                        }
                    }
                );
                console.log('Order status updated successfully');

            };

            if (newStatus == "pending") {

                // const result = await Orders.updateOne({ _id: orderId }, { $set: { status: newStatus } });

                const updateResult = await Orders.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [`items.${index}.status`]: newStatus,
                           
                        }
                    }
                );

                console.log('Order status updated successfully');

            };

            if (newStatus == "delivered") {

                console.log("it is delivered");



                var exp = Date.now() + (120 * 1000);
                // const result = await Orders.updateOne({ _id: orderId }, { $set: { status: newStatus } });
                // await Orders.updateOne({ _id: orderId }, { $set: { deliveredDate: date } });
                // await Orders.updateOne({ _id: orderId }, { $set: { returnCanceledOn: exp } });
                // await Orders.updateOne({ _id: orderId }, { $set: { paymentStatus: 1 } });

                const updateResult = await Orders.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [`items.${index}.status`]: newStatus,
                            [`items.${index}.deliveredDate`]: new Date(),
                            [`items.${index}.returnExp`]: exp,
                            [`items.${index}.paymentStatus`]: 1,
                        }
                    }
                );

                console.log("qualntity is.....",order.items[index].quantity )
                const salesCountt = await Category.updateOne(
                    { name: product.category },
                    { $inc: { salesCount: order.items[index].quantity } }
                );

                console.log("sales count tt is ",salesCountt);
               
                 const salesCountPr = await Product.updateOne(
                    { _id: product._id },
                    { $inc: { salesCount: order.items[index].quantity } }
                );

                console.log("sales count pr is ",salesCountPr);
             
                var order = await Orders.findOne({ _id: orderId });
             

                const sale = new Sales(
                    {
                        orderObjectId: order._id,
                        email: order.email,
                        orderId: order.orderId,
                        item: order.items[index],
                        address: order.address,
                        paymentOption: order.paymentOption,
                        paymentStatus: order.paymentStatus,
                        transactionId: order.transactionId,
                        orderDate: order.orderDate,
                        dispatchedDate: order.items[index].dispatchedDate,
                        deliveredDate: order.items[index].deliveredDate,
                        returnStatus: order.returnStatus,
                        grandTotal:order.grandTotal,


                    }
                );

                console.log("sale is ", sale);
                const saleResult = await sale.save();
                console.log("sale result is ", saleResult);

                const updatesalesId = await Orders.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [`items.${index}.salesId`]: saleResult._id,
                        }
                    }
                );

                console.log("update salse id details..",updatesalesId);





                console.log('Order status updated successfully');

            };


            if (newStatus === "cancelled") {

                // const result = await Orders.updateOne({ _id: orderId }, { $set: { status: newStatus } });
                // await Orders.updateOne({ _id: orderId }, { $set: { cancelledDate: date } });

                // await Product.updateOne({ _id: order.productId }, { $inc: { salesCount: -order.quantity } });

                // await Product.updateOne({ _id: order.productId }, { $inc: { totalStock: order.quantity } });

                // await Stock.updateOne({ $and: [{ productId: order.productId }, { productVariant: order.option }, { productColor: order.color }] }, { $inc: { stock: order.quantity } });

                console.log('Order status updated successfully');

                const user = await User.findOne({ email: order.email });
                console.log("user is ",user);

                if (user && (order.paymentOption === "online payment" || order.paymentOption === "wallet payment")) {
                    // Refund the payment amount to the user's wallet

                    console.log(" refund the payment......")
                    await User.updateOne({ email: order.email }, { $inc: { wallet: order.items[index].payAmount } });
        
                    const transactions = {
                        date: new Date(),
                        amount: order.items[index].payAmount,
                        status: "credit"
                    };

                    console.log("transaction is ... ",transactions);
                    await Wallet.updateOne({ user: order.email }, { $push: { transactions: transactions } }, { upsert: true });
                    
                };
        
                // Update the status of the specific item in the order
                const updateResult = await Orders.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [`items.${index}.status`]: 'cancelled',
                            [`items.${index}.cancelDate`]: new Date()
                        }
                    }
                );
        
                console.log("Update result.........:", updateResult);
                

            await Product.updateOne({_id:order.items[index].productId},{$inc:{salesCount:-order.items[index].quantity}});

            await Product.updateOne({ _id: order.items[index].productId }, { $inc: { totalStock:order.items[index].quantity } });
    
            await Stock.updateOne({ $and: [{productId:order.items[index].productId},{ productVariant:order.items[index].size }, { productColor:order.items[index].color }] },{$inc:{stock:order.items[index].quantity}});

            

            };


            const page = parseInt(req.body.currentPage);

            console.log("current page is ", page);
            const pageSize = 7; // Number of products per page

            const totalOrders = await Orders.countDocuments();
            const totalPages = Math.ceil(totalOrders / pageSize);

            const orders = await Orders.find({$or:[ {paymentOption:"cash on delivery"},
                {$and:[{paymentOption:"wallet payment"},{paymentStatus:1}]},
                {$and:[{paymentOption:"online payment"},{paymentStatus:1}]}]})

                .sort({orderDate:-1})
                .limit(pageSize)
                .skip((page - 1) * pageSize);


            res.json({ success: true, orders });

        } else {
            res.json({ success: false, msg: "ordser not found !" })
        }



    } catch (error) {
        console.log(error);
        res.render("adminSideErrors");
    }
};


module.exports = {
    loadAdminOrderManagement,
    updateOrderStatus,
 
}