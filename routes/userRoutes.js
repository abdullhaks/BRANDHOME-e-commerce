const express = require("express");
const userRoute = express();
const User = require("../models/userModel");

//----------------------------------


//----------------------------------

const auth = require("../middleware/auth");
const isBlocked = require("../middleware/isBlocked");

//-----------------------------------

const bodyParser = require("body-parser");
userRoute.use (bodyParser.json());
userRoute.use (bodyParser.urlencoded({extended:true}));

//----------------------------------

//-----------------------------------

//userRoute.set ("view engine", "ejs");
//userRoute.set ("views","./views");

//-----------------------------------

const userController = require("../controller/userCtrl");
const forgetPasswordController = require("../controller/forgetPasswordCtrl");
const addressController = require("../controller/addressCtrl");
const cartController = require("../controller/cartCtrl");
const wishListController = require("../controller/wishListCtrl");
const checkOutController = require("../controller/checkOutController");
const ordersController = require("../controller/ordersCtrl");
const googleAuthController = require("../controller/googleAuthCtrl");
const couponController = require("../controller/couponCtrl");
const profileController = require("../controller/profileCtrl");
//-----------------------------------

userRoute.get ("/",  userController.loadHome);
userRoute.get ("/login", auth.isLogout, userController.loadLogin);
 
userRoute.post ("/login",userController.verifyLogin);

//-------------------------------------

userRoute.get("/forgetPassword",userController.loadForgetPassword);
userRoute.post ("/forgetPassword",userController.checkemail); 
userRoute.post ("/submitRecoveryPassword", forgetPasswordController.checkRecoveryPassword);
userRoute.post ("/resendRecoveryPassword", forgetPasswordController.resentRecoveryPassword);
userRoute.post ("/newPassword", forgetPasswordController.verifyNewPassword);


//-------------------------------------

userRoute.get("/addresses/:productId",addressController.loadAddress);

userRoute.get("/addresses",addressController.loadAddress);

userRoute.post("/addAddress",addressController.addAddress);

userRoute.post("/addAddressFromCheckout",addressController.addAddressFromCheckout);

//-------------------------------------

userRoute.get("/auth/google", googleAuthController.googleAuth.authenticate);
userRoute.get("/auth/google/callback", googleAuthController.googleAuth.callback);

//-------------------------------------

userRoute.get ("/register", auth.isLogout,userController.loadRegister);


userRoute.post ("/register",userController.verifyRegister);

//--------------------------------------

userRoute.get ("/otp",function(req,res){
    const errors = req.query.errors;
    const user = req.query.user;
    res.render("otp",{errors,user});
});

userRoute.post("/submitotp",userController.checkOtp)
userRoute.get ("/resentotp/:email",userController.resentOtp)

//---------------------------------------

userRoute.get ("/home",isBlocked.isBlocked,auth.isLogin, userController.loadHome);

userRoute.get("/profile",profileController.loadProfile);

userRoute.get ("/products", userController.loadProducts); 

userRoute.get ("/productsDetails", userController.loadProductsDetails);


userRoute.get ("/addtoCart",isBlocked.isBlocked,auth.isLogin,cartController.addtoCart);

userRoute.get ("/cart",isBlocked.isBlocked,auth.isLogin,cartController.loadCart);

userRoute.get ("/removeFromCart",cartController.removeFromCart); 


userRoute.get ("/addtoWishList",isBlocked.isBlocked,auth.isLogin,wishListController.addtoWishList);

userRoute.get ("/wishList",isBlocked.isBlocked,auth.isLogin,wishListController.loadWishList);

userRoute.get ("/removeFromWishList",wishListController.removeFromWishList); 


userRoute.post ("/checkOut",auth.isLogin,checkOutController.loadCheckOut);

userRoute.get ("/getStock",checkOutController.getStock);


userRoute.post ("/verifyPayment",checkOutController.verifyPayment);

userRoute.post ("/checkCoupon",couponController.checkCoupon);




userRoute.post("/placeOrder",checkOutController.placeOrder);

userRoute.get("/orderPlaced",checkOutController.loadOrderPlaced)
 



//--------------------------------------

userRoute.get ("/orders",ordersController.loadOrders);
userRoute.get ("/orderManagement",ordersController.loadOrderManagement);

userRoute.post ("/cancelOrder/:id",ordersController.cancelOrder);

userRoute.post ("/returnOrder/:id",ordersController.returnOrder)

//--------------------------------------

userRoute.get ("/logout",auth.isLogin, userController.logout);

//--------------------------------------




module.exports = userRoute;