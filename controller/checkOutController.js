const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const Address = require("../models/addressmodel");
const Product = require("../models/productmodel");
const CheckOut = require("../models/checkoutMOdel");
const Orders = require("../models/orderModel");
const Stock = require("../models/stockModel");
const Wallet = require("../models/walletModel");
const Coupons = require ("../models/couponModel");
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_test_vDeFV4rhwkWFgQ',
    key_secret: 'aC0d2DpQ5cJI9NljtYQE4Oz8'
});



const loadCheckOut = async(req,res)=>{
    try{
        var email =  req.session.user;
        const user = await User.findOne({email:email});
        const checkItem = await CheckOut.findOne({user:email});

       var products= checkItem. products;
       var totalAmount= checkItem.totalAmount;
       var totalOffer= checkItem.totalOffer;
       var subTotal= checkItem.subTotal;

       const currentDate = new Date();
       await Coupons.deleteMany({ endsOn: { $lt: currentDate } });

       const coupons = await Coupons.find();

       const cart = await Cart.findOne({email:email});

       var cartNo = 0;
       if(cart){
       cartNo = cart.products.length;
       }

     const wishList = await WishList.findOne({email:email});

       var wishListNo = 0;
       if(wishList){
       wishListNo = wishList.products.length;
       };

       const addresses = await Address.find({email:email});


       return res.render("checkOut",{user,cartNo,wishListNo,addresses, products,
                                        totalAmount,totalOffer,subTotal,coupons});

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user:email,cartNo,wishListNo});
    }
}

const addToCheckOut = async(req,res)=>{
    try{
        var email =  req.session.user ;
        const user = await User.findOne({email:email});
        console. log ("user is ",user);       

        const formData = req.body;
        console.log("form data is ",formData);
        var products = [];

        

        var totalAmount = 0
        var totalOffer = 0;
        var subTotal = 0;
    
        // get product count 

        const productCount = Object.keys(formData).filter(key => key.startsWith('productId')).length;

        console.log("product count is "+productCount);
    
        for (let i = 0; i < productCount; i++) {

            var save= parseFloat(formData[`save${i}`]);

            const product = {
                productId: formData[`productId${i}`],
                productName: formData[`productName${i}`],
                productBrand: formData[`productBrand${i}`],
                productImage:formData[`productImage${i}`],
                price: parseFloat(formData[`productPrice${i}`]),
                size: formData[`option${i}`],
                color: formData[`color${i}`],
                quantity: parseInt(formData[`quantity${i}`], 10),
                offer:parseInt(formData[`totalOffer${i}`], 10),
                youSave: save * parseInt(formData[`quantity${i}`], 10),
                payAmount: (parseFloat(formData[`productPrice${i}`]) - save) * parseInt(formData[`quantity${i}`], 10),

            };

            

            products.push(product);

            totalOffer += product.youSave;
            totalAmount += product.payAmount
            subTotal += (product.price * product.quantity);
        };

    
        console.log(products); 
       
        console.log("total amount is "+totalAmount); 

        console.log("total offer is"+totalOffer);

        console.log("subTotal  is"+subTotal);

        const cart = await Cart.findOne({email:email});

        var cartNo = 0;
        if(cart){
        cartNo = cart.products.length;
        }
 
      const wishList = await WishList.findOne({email:email});
 
        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        };

        const delResult = await CheckOut.deleteMany({user:email});
        
        const check = new CheckOut ({
            user:email,
            products:products,
            totalAmount:totalAmount,
            totalOffer:totalOffer,
            subTotal:subTotal
        });

        const result = await check.save(); 
      


        return res.redirect("/checkOut");
    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user:email,cartNo,wishListNo});
    }
};



const placeOrder = async(req,res)=>{
    try{


        var user =  req.session.user ; 
        console.log("user is ",user);
        console.log(req.body.paymentOption);

        const formData = req.body;

        var id = Date.now();

        const totalOffer= parseInt(req.body.totalOffer);
        const grandTotal= parseInt(req.body.grandTotal);
        var couponOff= parseInt(req.body.couponOff);
        const saveByCoupon= parseInt(req.body.saveByCoupon);
        const appliedCouponId= req.body.appliedCouponId;
        var productIds = []; 
        var productNames= [];

        // console.log("appliedCouponId is "+appliedCouponId);
        const totalAmount = parseInt(req.body.totalAmount);
        const totalAmountAfterCoupon = parseInt(req.body.totalAmountAfterCoupon);
        
        
        var productCount = req.body.productCount ;
        var orders = [];

        // console . log ("product count is :"+ productCount);

       // const productCount2 = Object.keys(formData).filter(key => key.startsWith('productId')).length;

        for (let i = 0; i < productCount; i++) {
            var product = {
               
                
                
                productId: formData[`productId${i}`],
                productName: formData[`productName${i}`],
                productBrand: formData[`productBrand${i}`],
                productImage:formData[`productImage${i}`],
                price: parseFloat(formData[`productPrice${i}`]),
                shippingCharge:40,
                size: formData[`size${i}`],
                color: formData[`color${i}`],
                quantity: parseInt(formData[`quantity${i}`], 10),
                offer:parseInt(formData[`offer${i}`]),
                couponOffer:couponOff,
                youSave:parseInt(formData[`discount${i}`], 10),
                payAmount: parseInt(formData[`payAmount${i}`])+40,

            };

            productIds.push(product.productId);
            productNames.push(product.productName);

            if (appliedCouponId){
                const coupon = await Coupons.findById(appliedCouponId)

                // console.log("coupon is "+coupon);

                if((totalAmount*couponOff)/100>coupon.maxOff){
                    product.payAmount-= Math.round(saveByCoupon/productCount) ;
                    product.youSave += Math.round(saveByCoupon/productCount);

                    const result = await Coupons.updateOne({_id:coupon._id},{$push : {users:user}},{upsert:true}); 
                }else{
                    product.payAmount-= Math.round( (product.payAmount*couponOff)/100) ;
                    product.youSave += Math.round((product.payAmount*couponOff)/100);

                    const result = await Coupons.updateOne({_id:coupon._id},{$push : {users:user}},{upsert:true}); 
                }

            }


                     const datenow = new Date(); 

                     const options = { 
            
                            year: 'numeric',
                            month: 'numeric', 
                            day: 'numeric'
                        };

                    const date = datenow.toLocaleDateString('en-GB', options);

                    const address = {
                                email:user,
                                firstName:req.body.firstName,
                                lastName:req.body.lastName,
                                shippingEmail:req.body.shippingEmail,
                                mobile:req.body.mobile,
                                country:req.body.country,
                                state:req.body.state,
                                city:req.body.city,
                                street:req.body.street,
                                postalCode:req.body.postalCode,
                            };

                            const order = new Orders ({
                                        email:user,
                                        orderId:user+id ,
                                        purchaseDetails:product,
                                        address:address,
                                        paymentOption:req.body.paymentOption, 
                                        orderDate:date,
                                        orderTime:Date.now(),
                             
                                    });
                            
                                     
                            
                                    var result = await order.save();
                                    orders.push(order);
                            
                                    // console.log("order details is "+ result);

           

           
        };


        const delResult = await CheckOut.deleteMany({user:user});

                if(req.body.paymentOption === "online payment"){

                    // Initialize Razorpay payment
                        const paymentOptions = {
                        amount: req.body.grandTotal*100, 
                        currency: 'INR',
                        receipt: result.orderId // Unique order ID
                    };

                    // console.log("paymentOption is "+ paymentOptions.receipt);
                    // console.log("product is ",product);

                    await  razorpay.orders.create(paymentOptions,
                        (err,order)=>{
                            if(!err){

                                // console.log("order is",order);
                                res.status(200).send({
                                    success:true,
                                    productNames:productNames,
                                    productIds:productIds,
                                    orders:orders,
                                    msg:"Order Created",
                                    order_id:order.id,
                                    receipt:order.receipt,
                                    amount:order.amount,
                                    key_id:'rzp_test_vDeFV4rhwkWFgQ',
                                    company_name:'BRANDHOME',
                                    description:productNames.join(","),
                                    contact:req.body.mobile,
                                    user:order.email,
                                    email:req.body.shippingEmail
                                })
                            }else{
                                res.status(400).send({success:false,msg:"Something went wrong"})
                                console.log(err);
                            }
                        });

                        //Return Razorpay payment details to the frontend
                    // return res.json({  razorpayPayment: payment });

                }else if(req.body.paymentOption === "cash on delivery"){

                for (let i = 0; i < productCount; i++) {

                

                 
                 await Product.updateOne({ _id: orders[i].purchaseDetails.productId },
                                                             { $inc: { totalStock:-orders[i].purchaseDetails.quantity } });

                 await Stock.updateOne({ $and: [{productId:orders[i].purchaseDetails.productId },
                                                                    { productVariant: orders[i].purchaseDetails.size},
                                                                    { productColor: orders[i].purchaseDetails.color}] },
                                                                    {$inc:{stock:-orders[i].purchaseDetails.quantity}});

                             
                    var productId=orders[i].purchaseDetails.productId;
                    var color=orders[i].purchaseDetails.color;
                    var size=orders[i].purchaseDetails.size;

                const result = await Cart.updateOne(
                    { email: user },
                    { $pull: { products: { productId,color, size } } }
                );

                            };



                   
                               
                            res.status(200).send({
                                COD:true,});
                         

                    

                      // res.redirect("/orderPlaced");

                }else if (req.body.paymentOption === "wallet payment"){

                    console.log("i am hereeee")

                    for (let i = 0; i < productCount; i++) {

                        await Cart.updateOne({email:user},{$pull : {products:productIds[i]}});


                        await Product.updateOne({ _id: orders[i].purchaseDetails.productId },
                            { $inc: { totalStock:-orders[i].purchaseDetails.quantity } });

                        await Stock.updateOne({ $and: [{productId:orders[i].purchaseDetails.productId },
                                                        { productVariant: orders[i].purchaseDetails.size},
                                                        { productColor: orders[i].purchaseDetails.color}] },
                                                        {$inc:{stock:-orders[i].purchaseDetails.quantity}});


                            var productId=orders[i].purchaseDetails.productId;
                            var color=orders[i].purchaseDetails.color;
                            var size=orders[i].purchaseDetails.size;
        
                        const result = await Cart.updateOne(
                            { email: user },
                            { $pull: { products: { productId,color, size } } }
                        );

                        
                       };

                       const gndtotl = req.body.grandTotal

                       console.log("user and gndtotl is ",user,gndtotl);

                      const gtup= await User.updateOne({ email: user }, { $inc: { wallet: -gndtotl } });
                      const transactions={
                        date:new Date(),
                        amount:parseInt(gndtotl),
                        status:"debit"
                      }
                      const trans = await Wallet.updateOne({user:user},{$push:{transactions:transactions}} ,{upsert:true});
                       console.log("gtup",gtup);
                      const paymntstts= await Orders.updateMany({ orderId: orders[0].orderId }, { $set: { paymentStatus: 1 } });
                       console.log("paymntstts is ",paymntstts);
                    res.status(200).send({
                        WALLET:true,});

                }else{

                    res.send({
                        msg:"something went wrong"});
                        
                }

        
        

    }catch(error){

        console.log(error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

const getStock = async (req, res) => {
    try {
        const { size, color, productId } = req.query;

        const stock = await Stock.findOne({
            productId,
            productVariant: size,
            productColor: color
        });

        if (!stock) {
            return res.status(404).json({ error: "Stock not found" });
        }

        res.json({ quantity: stock.stock });
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



const getStockFromPrductDetails = async (req, res) => {
    try {
        console.log("Fetching stock details...");

        const size = req.query.size;
        const color = req.query.color;
        const productId = req.query.productId;

        console.log("Size:", size, "Color:", color, "Product ID:", productId);

        const stock = await Stock.findOne({ 
            productId: productId, 
            productVariant: size, 
            productColor: color 
        });

        if (!stock || stock.stock < 1) {
            return res.json({ success: false, msg: "Stock not found" });
        } else {
            console.log("Stock available:", stock.stock);
            return res.json({ success: true, stock: stock.stock });
        }
    } catch (error) {
        console.error("Error fetching stock:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const loadOrderPlaced = async(req,res)=>{
    try{

        req.session.products = '';
        req.session.totalAmount= '';
        req.session.totalOffer = '';
        req.session.subTotal = '';

        var id = await req.session.user 

        const cart = await Cart.findOne({email:id});
     
        var cartNo = 0;
        if(cart){
         cartNo = cart.products.length;
        console.log(cartNo);
        };

        const wishList = await WishList.findOne({email:id});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

        return res.render("orderPlaced",{user:id,cartNo,wishListNo})
        

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user:id,cartNo,wishListNo});
    }
};


const verifyPayment = async(req,res)=>{

    try{

        const user = req.session.user;

        console . log ( req.body);

        const { payment,order} = req.body;


        console.log("order from verify payment....",order);

        var orders=order.orders;

        //add crypto module
        const { createHmac } = require('node:crypto');

            const secret = 'aC0d2DpQ5cJI9NljtYQE4Oz8';
            const hash = createHmac('sha256', secret)
                        .update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
                        .digest('hex');
            console.log(hash);

            if (hash == payment. razorpay_signature) {

                console.log("payment success");

                const result = await Orders.updateMany({orderId:order.receipt},
                                {$set:{paymentStatus:1}});

                                console.log(result);

                                for (let i = 0; i < order.productIds.length; i++) {
                          
                                 
                                     await Cart.updateOne({email:user},{$pull : {products:order.productIds[i]}});

                                     await Product.updateOne({ _id: orders[i].purchaseDetails.productId },
                                        { $inc: { totalStock:-orders[i].purchaseDetails.quantity } });
            
                                    await Stock.updateOne({ $and: [{productId:orders[i].purchaseDetails.productId },
                                                                    { productVariant: orders[i].purchaseDetails.size},
                                                                    { productColor: orders[i].purchaseDetails.color}] },
                                                                    {$inc:{stock:-orders[i].purchaseDetails.quantity}});

                                        var productId=orders[i].purchaseDetails.productId;
                                        var color=orders[i].purchaseDetails.color;
                                        var size=orders[i].purchaseDetails.size;
                    
                                    const result = await Cart.updateOne(
                                        { email: user },
                                        { $pull: { products: { productId,color, size } } }
                                    );
            
                                
                                    }

                                res.json({status:true});
                
              }else{
                
                res.json({status:false,errorMsg:"Payment Failed.Try Again"});
              }

             

              




    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }



}

module.exports = {
    addToCheckOut,
    placeOrder,
    getStock,
    loadOrderPlaced,
    verifyPayment,
    getStockFromPrductDetails,
    loadCheckOut,

}