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
const Wallet = require("../models/walletModel");
const Category = require("../models/categorymodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const session = require("express-session");
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');


const loadOrders = async (req,res)=>{ 
    try{
        var user = await req.session.user ;

     

      

      const orders = await Orders.find({
        email: user,
        $or: [
          { paymentOption: "cash on delivery" },
          { paymentOption: "wallet payment" ,paymentStatus: 1 },
          { paymentOption: "online payment" },
        ],
      }).sort({ orderDate: -1 });


      const cart = await Cart.findOne({email:user});
 
        var cartNo = 0;
        if (cart) {
            cartNo = cart.products.length;
            console.log(cartNo);
        }

      const wishList = await WishList.findOne({email:user});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

      let currentTime = Date.now();

        res. render ("orders",{user,cartNo,orders,currentTime,wishListNo});

    }catch(error){
     console.log(error);
     return res.render("userSideErrors",{user,cartNo,wishListNo});
    }
};

const cancelOrder = async (req,res)=>{
    try{
        var id = req.query.orderId.trim();  
        var index = parseInt(req.query.itemNo.trim());
        var email = req.session.user;


        const cart = await Cart.findOne({email:email});
 
        var cartNo = 0;
        if (cart) {
            cartNo = cart.products.length;
            console.log(cartNo);
        }

      const wishList = await WishList.findOne({email:email});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }


        console.log('Order ID:', id);
        console.log("Item index:", index);

        // Retrieve the order by its _id, not orderId
        const order = await Orders.findOne({ _id: id });

        if (!order) {
            console.log("Order not found");
            return res.render("userSideErrors", { user:email,cartNo,wishListNo });
        }

        console.log("Item to be cancelled:", order.items[index]);

        const user = await User.findOne({ email: email });

        if (user && (order.paymentOption === "online payment" || order.paymentOption === "wallet payment")) {
            // Refund the payment amount to the user's wallet
            await User.updateOne({ email: email }, { $inc: { wallet: order.items[index].payAmount } });

            const transactions = {
                date: new Date(),
                amount: order.items[index].payAmount,
                status: "credit"
            };
            await Wallet.updateOne({ user: email }, { $push: { transactions: transactions } }, { upsert: true });
        }

        // Update the status of the specific item in the order
        const updateResult = await Orders.updateOne(
            { _id: id },
            {
                $set: {
                    [`items.${index}.status`]: 'cancelled',
                    [`items.${index}.cancelDate`]: new Date()
                }
            }
        );

        console.log("Update result:", updateResult);

        if (updateResult.matchedCount === 0) {
            console.log("No order found with the given ID.");
        } else if (updateResult.modifiedCount === 0) {
            console.log("The document was found but not modified. Double-check the index or the existing status.");
        } else {
            console.log("Item status updated successfully.");
        }

    
   

            await Product.updateOne({_id:order.items[index].productId},{$inc:{salesCount:-order.items[index].quantity}});

            await Product.updateOne({ _id: order.items[index].productId }, { $inc: { totalStock:order.items[index].quantity } });
    
            await Stock.updateOne({ $and: [{productId:order.items[index].productId},{ productVariant:order.items[index].size }, { productColor:order.items[index].color }] },{$inc:{stock:order.items[index].quantity}});

            

        return res. redirect("/orders");
    }catch(error){
        console.log(error); 
        return res.render("userSideErrors",{user:email,cartNo,wishListNo});
    }
};


const loadOrderManagement = async(req,res)=>{
    try{

        var user = await req.session.user 

      const cart = await Cart.findOne({email:user});

      const orderId = req.query.orderId;
      const itemNo = req.query.itemNo;


      console.log("order id is "+orderId);

      const trimOrderId = orderId.trim();
    
      var order = await Orders.findOne({_id:trimOrderId});
       var orderItem = order.items[itemNo];
      const product = await Product.findOne({_id:order.productId});


      var cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      console.log(cartNo);
      }

      const wishList = await WishList.findOne({email:user});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

        return res.render("orderManagement",{user,cartNo,order,orderItem,product,wishListNo});

    }catch(error){

        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo});

    }
};


const returnOrder = async (req,res)=>{
    try{

        const id = req.query.orderId.trim();  
        const index = parseInt(req.query.itemNo.trim());

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
    
            
       

        const returnReason = req.body.returnReason;

         console.log("it is running"+returnReason);

        console.log("checking.....:",returnReason==="damaged");

        
        const result = await Orders.updateOne({_id:id },{$set:{returnStatus:1}});

        const updateResult = await Orders.updateOne(
            { _id: id },
            {
                $set: {
                    [`items.${index}.returnStatus`]: 1,
                    [`items.${index}.returnRequestOn`]: new Date()
                }
            }
        );


        const order = await Orders.findOne({_id:id });

        const datenow = new Date(); 
        const options = { 
            
            year: 'numeric',
            month: 'numeric', 
            day: 'numeric'
        };


        
        const date = datenow.toLocaleDateString('en-GB', options);

        const returns = new Returns ({
            orderId:order.orderId,
            index:index,
            user:order.email,
            item:order.items[index],
            returnReason:req.body.returnReason,
            requestDate:order.items[index].returnRequestOn,
        });

        await returns.save();

        
        
        return res. redirect("/orders");

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user,cartNo,wishListNo});
    }
};


const getInvoice = async(req,res)=>{
    try{
        const orderId = req.params.orderId;
       
        const order = await Orders.findById(orderId);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Generate invoice data using easyinvoice
        const invoiceData = {
            "documentTitle": "INVOICE", // Defaults to INVOICE
            "currency": "INR",
            "taxNotation": "GST", // GST/VAT
            "marginTop": 25,
            "marginRight": 25,
            "marginLeft": 25,
            "marginBottom": 25,
            "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
            "sender": {
                "company": "BRANDHOME co",
                "address": "near city centre malappuram",
                "zip": "12345",
                "city": "malappuram,kerala",
                "country": "India",
               
            },
            "client": {
                "company": `${order.address.firstName} ${order.address.lastName}`,
                "address": order.address.street,
                "zip": order.address.postalCode,
                "city": order.address.city,
                "country": order.address.country
            },
            "invoiceNumber": order.orderId,
            "invoiceDate": new Date(order.orderDate).toLocaleDateString(),
            "products": order.items.map(item => ({
                "quantity": item.quantity,
                "description": `${item.productName}, ${item.size}, ${item.color}`,
                "tax": 0, // Set tax if applicable
                "price": item.payAmount
            })),
            "bottomNotice": "Thank you for your purchase!" // Customize the bottom notice
        };

     // Generate the PDF
     const result = await easyinvoice.createInvoice(invoiceData);

     // Define the directory and file path
     const invoicesDir = path.join(__dirname, '..', 'invoices');
     const filePath = path.join(invoicesDir, `invoice_${orderId}.pdf`);

     // Check if the directory exists, if not, create it
     if (!fs.existsSync(invoicesDir)) {
         fs.mkdirSync(invoicesDir, { recursive: true });
     }

     // Save the PDF to the server
     fs.writeFileSync(filePath, result.pdf, 'base64');

     // Send the PDF to the user
     res.download(filePath, `invoice_${orderId}.pdf`, () => {
         // Optionally delete the file after sending it
         fs.unlinkSync(filePath);
     });
    }catch(error){
        console.log(error);
        res.status(500).send('An error occurred while generating the invoice.');
        
    }
}

module.exports = {
    loadOrders,
    cancelOrder,
    loadOrderManagement,
    returnOrder,
    getInvoice,
}

