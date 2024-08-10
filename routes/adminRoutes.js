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
  isAdmin.isAdmin,
  adminController.userManagement
);

adminRoute.post("/blockuser", auth.isLogin, adminController.blockUser);
adminRoute.post("/unblockuser", auth.isLogin, adminController.unblockUser);

//--------------------------------------

adminRoute.get("/categoryManagement", productController.loadCategoryManagement);

adminRoute.post("/categoryManagement", productController.addCategory);

adminRoute.get(
  "/categoryManagementEdit",
  productController.loadCategoryManagementEdit
);

adminRoute.post("/categoryManagementEdit", productController.editCategory);

adminRoute.post(
  "/unlistCategory/:categoryName",
  productController.unlistCategory
);

adminRoute.post("/listCategory/:categoryName", productController.listCategory);

//--------------------------------------

adminRoute.get("/allProducts", productController.loadAllProducts);

adminRoute.get("/ProductEdit", productController.loadProductEdit);

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

adminRoute.post("/ProductEdit", upload, productController.editProduct);

adminRoute.post("/unlistProduct/:productId", productController.unlistProduct);

adminRoute.post("/listProduct/:productId", productController.listProduct);

//-------------------------------------

adminRoute.get("/stockManagement", stockController.loadStockManagement);

adminRoute.get(
  "/loadProductStocks/:productId",
  stockController.loadProductStocks
);

adminRoute.post("/addStock/:productId", stockController.addStock);

//-------------------------------------

adminRoute.get(
  "/orderManagement",
  adminOrderController.loadAdminOrderManagement
);

adminRoute.post("/updateOrderStatus", adminOrderController.updateOrderStatus);

//.....................................

adminRoute.get(
  "/returnManagement",
  adminReturnController.loadAdminReturnManagement
);

adminRoute.post("/updateReturnStatus", adminReturnController.updateReturnStatus);

//-------------------------------------

adminRoute.get(
  "/offersManagement",
  adminOffersController.loadAdminOffersManagement
);

adminRoute.get(
  "/categoryOffersManagement",
  adminOffersController.loadAdminCategoryOffersManagement 
);

adminRoute.get(
  "/productOffersManagement",
  adminOffersController.loadAdminProductOffersManagement 
);

adminRoute.post (
  "/addCategoryOffer",
  adminOffersController.addCategoryOffer
);

adminRoute.post (
  "/addProductOffer",
  adminOffersController.addProductOffer
);

adminRoute.post (
  "/endCategoryOffer",
  adminOffersController.endCategoryOffer
);

adminRoute.post (
  "/endProductOffer",
  adminOffersController.endProductOffer
);



//-------------------------------------
adminRoute.get (
  "/couponManagement",
  adminCouponController.loadAdminCouponManagement
);

adminRoute.post (
  "/couponManagement",
  adminCouponController.addCoupon
);

//------------------------------------

adminRoute.get (
  "/salesManagement", 
  adminSalesController.loadAdminSalesManagement
);


adminRoute.post (
  "/salesManagement", 
  adminSalesController.filterAdminSalesManagement
);

adminRoute.post(
  "/downloadPdf",
  adminSalesController.downloadPdf
);

adminRoute.get(
  "/downloadXl",
  adminSalesController.downloadXl
);



//-------------------------------------

adminRoute.get("/logout", auth.isLogin, adminController.logout);

//--------------------------------------

adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});

module.exports = adminRoute;
