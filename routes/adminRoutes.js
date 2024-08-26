const express = require("express");
const adminRoute = express();

//----------------------------------

const config = require("../config/config");

//----------------------------------

const auth = require("../middleware/adminAuth");
const isAdmin = require("../middleware/isAdmin");

//-----------------------------------

const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

//----------------------------------
const multer = require("multer");
const path = require("path");
//-----------------------------------

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views");

//-----------------------------------

const adminController = require("../controller/adminCtrl");
const productController = require("../controller/productCtrl");
const stockController = require("../controller/stockCtrl");
const adminOrderController = require("../controller/adminOrderCtrl");
const adminReturnController = require("../controller/adminReturnCtrl");
const adminOffersController = require ("../controller/adminOffersCtrl");
const adminCouponController = require ("../controller/adminCouponCtrl");
const adminSalesController = require("../controller/adminSalesCtrl");

//-----------------------------------

adminRoute.get("/",auth.isLogout,  adminController.loadLogin);
adminRoute.post("/", adminController.verifyLogin);

//-------------------------------------

adminRoute.get(
  "/home",
  auth.isLogin,
  isAdmin.isAdmin,
  adminController.loadDashBoard
);

//-------------------------------------

adminRoute.get(
  "/userManagement",
  auth.isLogin,
  isAdmin.isAdmin,
  adminController.userManagement
);

adminRoute.post("/blockuser", auth.isLogin,
  isAdmin.isAdmin, adminController.blockUser);
adminRoute.post("/unblockuser", auth.isLogin,
  isAdmin.isAdmin, adminController.unblockUser);

//--------------------------------------

adminRoute.get("/categoryManagement",auth.isLogin,
  isAdmin.isAdmin, productController.loadCategoryManagement);

adminRoute.post("/categoryManagement",auth.isLogin,
  isAdmin.isAdmin, productController.addCategory);

adminRoute.get(
  "/categoryManagementEdit",auth.isLogin,
  isAdmin.isAdmin,
  productController.loadCategoryManagementEdit
);

adminRoute.post("/categoryManagementEdit",auth.isLogin,
  isAdmin.isAdmin, productController.editCategory);

adminRoute.post(
  "/unlistCategory/:categoryName",auth.isLogin,
  isAdmin.isAdmin,
  productController.unlistCategory
);

adminRoute.post("/listCategory/:categoryName",auth.isLogin,
  isAdmin.isAdmin, productController.listCategory);

//--------------------------------------

adminRoute.get("/allProducts",auth.isLogin,
  isAdmin.isAdmin, productController.loadAllProducts);

adminRoute.get("/ProductEdit",auth.isLogin,
  isAdmin.isAdmin, productController.loadProductEdit);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size if needed
}).fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

adminRoute.post("/ProductEdit",auth.isLogin,
  isAdmin.isAdmin, upload, productController.editProduct);

adminRoute.post("/unlistProduct/:productId",auth.isLogin,
  isAdmin.isAdmin, productController.unlistProduct);

adminRoute.post("/listProduct/:productId",auth.isLogin,
  isAdmin.isAdmin, productController.listProduct);

//-------------------------------------

adminRoute.get("/stockManagement",auth.isLogin,
  isAdmin.isAdmin, stockController.loadStockManagement);

adminRoute.get(
  "/loadProductStocks/:productId",auth.isLogin,
  isAdmin.isAdmin,
  stockController.loadProductStocks
);

adminRoute.post("/addStock/:productId",auth.isLogin,
  isAdmin.isAdmin, stockController.addStock);

//-------------------------------------

adminRoute.get(
  "/orderManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminOrderController.loadAdminOrderManagement
);

adminRoute.post("/updateOrderStatus",auth.isLogin,
isAdmin.isAdmin, adminOrderController.updateOrderStatus);


  

//.....................................

adminRoute.get(
  "/returnManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminReturnController.loadAdminReturnManagement
);

adminRoute.post("/updateReturnStatus",auth.isLogin,
  isAdmin.isAdmin, adminReturnController.updateReturnStatus);

//-------------------------------------

adminRoute.get(
  "/offersManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.loadAdminOffersManagement
);

adminRoute.get(
  "/categoryOffersManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.loadAdminCategoryOffersManagement 
);

adminRoute.get(
  "/productOffersManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.loadAdminProductOffersManagement 
);

adminRoute.post (
  "/addCategoryOffer",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.addCategoryOffer
);

adminRoute.post (
  "/addProductOffer",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.addProductOffer
);

adminRoute.post (
  "/endCategoryOffer",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.endCategoryOffer
);

adminRoute.post (
  "/endProductOffer",auth.isLogin,
  isAdmin.isAdmin,
  adminOffersController.endProductOffer
);



//-------------------------------------
adminRoute.get (
  "/couponManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminCouponController.loadAdminCouponManagement
);

adminRoute.post (
  "/couponManagement",auth.isLogin,
  isAdmin.isAdmin,
  adminCouponController.addCoupon
);

adminRoute.post (
  "/editCoupon",auth.isLogin,
  isAdmin.isAdmin,
  adminCouponController.editCoupon
);

adminRoute.delete (
  "/couponDelete",auth.isLogin,
  isAdmin.isAdmin,
  adminCouponController.deleteCoupon
);

//------------------------------------

adminRoute.get (
  "/salesManagement", auth.isLogin,
  isAdmin.isAdmin,
  adminSalesController.loadAdminSalesManagement
);


adminRoute.post (
  "/salesManagement", auth.isLogin,
  isAdmin.isAdmin,
  adminSalesController.filterAdminSalesManagement
);

adminRoute.post(
  "/downloadPdf",auth.isLogin,
  isAdmin.isAdmin,
  adminSalesController.downloadPdf
);

adminRoute.post(
  "/downloadXl",auth.isLogin,
  isAdmin.isAdmin,
  adminSalesController.downloadXl
);



//-------------------------------------

adminRoute.get("/logout", auth.isLogin, adminController.logout);

//--------------------------------------

adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = adminRoute;
