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

userRoute.post ("/changePassword",isBlocked.isBlocked,auth.isLogin,userController.changePassword)

//-------------------------------------

userRoute.get("/addresses",isBlocked.isBlocked,auth.isLogin,addressController.loadAddress);

userRoute.post("/addAddress",isBlocked.isBlocked,auth.isLogin,addressController.addAddress);

userRoute.post("/addAddressFromCheckout",isBlocked.isBlocked,auth.isLogin,addressController.addAddressFromCheckout);

userRoute.get("/deleteAddress",isBlocked.isBlocked,auth.isLogin,addressController.deleteAddress);

userRoute.post("/editAddress",isBlocked.isBlocked,auth.isLogin,addressController.editAddress);


userRoute.post ("/editProfile",isBlocked.isBlocked,auth.isLogin,userController.editProfile);
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

userRoute.get("/profile",isBlocked.isBlocked,auth.isLogin,profileController.loadProfile);

userRoute.get ("/products", userController.loadProducts); 

userRoute.get ("/productsDetails", userController.loadProductsDetails);


userRoute.post ("/addtoCart",isBlocked.isBlocked,auth.isLogin,cartController.addtoCart);

// userRoute.post ("/addtoCartFromWishlist",isBlocked.isBlocked,auth.isLogin,cartController.addtoCartFromWishlist);

userRoute.get ("/cart",isBlocked.isBlocked,auth.isLogin,cartController.loadCart);

userRoute.delete ("/removeFromCart",isBlocked.isBlocked,auth.isLogin,cartController.removeFromCart); 

userRoute.post ("/cart",isBlocked.isBlocked,auth.isLogin,checkOutController.addToCheckOut);

userRoute.post ("/addtoWishList",isBlocked.isBlocked,auth.isLogin,wishListController.addtoWishList);

userRoute.get ("/wishList",isBlocked.isBlocked,auth.isLogin,wishListController.loadWishList);

userRoute.get ("/removeFromWishList",isBlocked.isBlocked,auth.isLogin,wishListController.removeFromWishList); 

userRoute.get ("/checkOut",isBlocked.isBlocked,auth.isLogin,checkOutController.loadCheckOut);


userRoute.get ("/getStock",isBlocked.isBlocked,auth.isLogin,checkOutController.getStock);
userRoute.get ("/getStockFromPrductDetails",checkOutController.getStockFromPrductDetails);




userRoute.post ("/verifyPayment",isBlocked.isBlocked,auth.isLogin,checkOutController.verifyPayment);

userRoute.post ("/checkCoupon",isBlocked.isBlocked,auth.isLogin,couponController.checkCoupon);




userRoute.post("/placeOrder",isBlocked.isBlocked,auth.isLogin,checkOutController.placeOrder);

userRoute.post("/completePayment",isBlocked.isBlocked,auth.isLogin,checkOutController.completePayment);

userRoute.get("/orderPlaced",isBlocked.isBlocked,auth.isLogin,checkOutController.loadOrderPlaced);
 



//--------------------------------------

userRoute.get ("/orders",isBlocked.isBlocked,auth.isLogin,ordersController.loadOrders);
userRoute.get ("/orderManagement",isBlocked.isBlocked,auth.isLogin,ordersController.loadOrderManagement);

userRoute.post ("/cancelOrder",isBlocked.isBlocked,auth.isLogin,ordersController.cancelOrder);

userRoute.post ("/returnOrder",isBlocked.isBlocked,auth.isLogin,ordersController.returnOrder);

userRoute.get ("/downloadInvoice/:orderId",isBlocked.isBlocked,auth.isLogin,ordersController.getInvoice);

//--------------------------------------

userRoute.get ("/logout",auth.isLogin, userController.logout);

//--------------------------------------




module.exports = userRoute;