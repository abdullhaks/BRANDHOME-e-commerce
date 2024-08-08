const express = require("express");
const productRoute = express();
const fs = require("fs")
const multer = require("multer");
const path = require("path");
const sharp = require('sharp');
productRoute.use (express.static("public"));

//----------------------------------

const config = require("../config/config");

//----------------------------------

const auth = require("../middleware/adminAuth");

//-----------------------------------

const bodyParser = require("body-parser");
productRoute.use (bodyParser.json());
productRoute.use (bodyParser.urlencoded({extended:true}));

//----------------------------------

productRoute.set ("view engine", "ejs");
productRoute.set ("views","./views");

//-----------------------------------


const productController = require("../controller/productCtrl")

//------------------------------------


productRoute.get ("/addProduct",productController.loadAddProduct)


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({
    storage: storage,  
    limits: { fileSize: 1000000 } // Limit file size if needed
  }).fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
  ]); 



// Assuming productController.addProduct is a function handling the logic of adding a product
productRoute.post("/addProduct",upload, productController.addProduct);

















module.exports = productRoute;