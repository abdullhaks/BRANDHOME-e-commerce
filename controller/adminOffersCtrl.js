const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Returns = require("../models/returnModel");
const Category = require("../models/categorymodel");
const CategoryOffer = require("../models/categotyOfferModel");
const ProductOffer = require("../models/productOfferModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail");



const loadAdminOffersManagement = async(req,res)=>{
    try{

        const categoryOffers = await CategoryOffer.find({offerPercentage:{$gt:0}});
        const productOffers = await ProductOffer.find({offerPercentage:{$gt:0}});

        res.render("adminOfferManagement",{categoryOffers,productOffers});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const loadAdminCategoryOffersManagement = async(req,res)=>{
    try{

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 7; // Number of products per page

        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / pageSize);

        const categories = await Category.find()
        .sort({name:1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);


        return res.render("adminAddCategoryOffer",{categories,currentPage:page, totalPages});


    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const loadAdminProductOffersManagement = async(req,res)=>{
    try{

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 7; // Number of products per page

        const totalProducts = await Category.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageSize);

        const products = await Product.find()
        .sort({productName:1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);


        return res.render("adminAddProductOffer",{products,currentPage:page, totalPages});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const endCategoryOffer = async(req,res)=>{
    try{

        const categoryId = req.query.id;

        console.log("category id is "+categoryId)
        const offerPercentage =0;

        console.log("offerPercentage is "+offerPercentage);

        const category = await Category.findOne({ _id: categoryId });

        console.log("category is "+category);

        category.categoryOfferPercentage=offerPercentage;

        await category.save();

       
        await CategoryOffer.findOneAndUpdate(
            { categoryId: categoryId },
            { $set: { categoryId: categoryId, categoryName: category.name, offerPercentage: offerPercentage } }
            
        );

        await Product.updateMany({category:category.name},{$set:{categoryOfferPercentage:offerPercentage}});

       
        console.log("Category offer ended successfully.");

        res.redirect("/admin/offersManagement");


    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const endProductOffer = async(req,res)=>{
    try{

        const productId = req.query.id;

        console.log("product id is "+productId);

        const offerPercentage =0;

        console.log("offerPercentage is "+offerPercentage);

        const product = await Product.findOne({ _id: productId });

        console.log("product is "+product);

        product.productOfferPercentage=offerPercentage;

        await product.save();

       
        await ProductOffer.findOneAndUpdate(
            { productId: productId },
            { $set: { productId: productId , productName: product.productName, offerPercentage: offerPercentage } }
        
        );

        
       
        console.log("Product ended successfully.");

        res.redirect("/admin/offersManagement");

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const addProductOffer = async(req,res)=>{
    try{

        const productId = req.body.productId;

        console.log("product id is "+productId);

        const offerPercentage =parseInt(req.body.productOffer) ;

        console.log("offerPercentage is "+offerPercentage);

        const product = await Product.findOne({ _id: productId });

        console.log("product is "+product);

        product.productOfferPercentage=offerPercentage;

        await product.save();

       
        await ProductOffer.findOneAndUpdate(
            { productId: productId },
            { $set: { productId: productId , productName: product.productName, offerPercentage: offerPercentage } },
            { upsert: true } 
        );

        
       
        console.log("Product offer added successfully.");

        res.redirect("/admin/productOffersManagement")

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const addCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        console.log("category id is "+categoryId);

        const offerPercentage =parseInt(req.body.categoryOffer) ;
         console.log("offerPercentage is "+offerPercentage);

        const category = await Category.findOne({ _id: categoryId });

        console.log("category is "+category);

        category.categoryOfferPercentage=offerPercentage;

        await category.save();

       
        await CategoryOffer.findOneAndUpdate(
            { categoryId: categoryId },
            { $set: { categoryId: categoryId, categoryName: category.name, offerPercentage: offerPercentage } },
            { upsert: true } 
        );

        await Product.updateMany({category:category.name},{$set:{categoryOfferPercentage:offerPercentage}});

       
        console.log("Category offer added successfully.");

        res.redirect("/admin/categoryOffersManagement")

    } catch (error) {
        console.log(error);
        res.render("adminSideErrors");
    }
};

module.exports = {
    loadAdminOffersManagement,
    loadAdminCategoryOffersManagement,
    loadAdminProductOffersManagement,
    endCategoryOffer,
    endProductOffer,
    addProductOffer,
    addCategoryOffer,

}