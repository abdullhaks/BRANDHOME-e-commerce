const Category = require("../models/categorymodel");
const Product = require("../models/productmodel");
const Stock = require("../models/stockModel");











const loadCategoryManagement = async (req,res)=>{

    try{
        const errors = req.query.errors;
        const categories = await Category.find().sort({name:1});
        
        res.render("adminCategoryManagement2",{errors,categories});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};


const addCategory  =  async (req,res)=>{
    try{
      const categories = await Category.find();
        const CategoryName = new Category ({
            name:req.body.category.toUpperCase()
           
        });

        console.log (CategoryName)
        
        var errors = [];

 
        const nameInput = CategoryName.name.trim()
        if (!nameInput) {
          errors.push({ msg: "Name is required" });
        }  else if (!/^[a-zA-Z\s]+$/.test(CategoryName.name)) {
    errors.push({ msg: "Name should not contain special keys  " });
  };

  if (errors.length > 0) {
    // If yes, render the signup form again with the errors and the user input
    res.render("adminCategoryManagement2", { errors: errors,categories});
  }else {
    // If no, check if the email already exists in the database
    const data = await Category.findOne({ name: CategoryName.name });
      if (data) {
        // If the email already exists, render the signup form again with an error message
        errors.push({ msg: "category already entered  " });
        res.render("adminCategoryManagement2", { errors: errors,categories});
      }else{
        const result = await CategoryName.save();
        const categories = await Category.find().sort({name:1});
        return  res.render("adminCategoryManagement2",{ errors: errors,categories});
      }

    }

    }catch(error){
      console.log(error);
      res.render("adminSideErrors");

    }
    

};

const loadCategoryManagementEdit = async (req,res)=>{

  try{
      const categoryId = req.query.categoryId;
      const errors = [];

      const category = await Category.findOne({_id:categoryId})

      const categories = await Category.find().sort({name:1});
      
      res.render("adminCategoryManagement2Edit",{ errors,categories,category });

  }catch(error){
    console.log(error);
    res.render("adminSideErrors");
  }
};

const editCategory  =  async (req,res)=>{
  try{

    const categories = await Category.find();

    const category = await Category.find({_id:req.query.categoryId});

    const prevCategoryName = category.name;
    
    const categoryName = req.body.category.toUpperCase()
         
     
      console.log (categoryName)
      
      var errors = [];


      const nameInput = categoryName.trim()
      if (!nameInput) {
        errors.push({ msg: "Name is required" });
      }  else if (!/^[a-zA-Z\s]+$/.test(categoryName)) {
  errors.push({ msg: "Name should not contain special keys  " });
};

if (errors.length > 0) {
  // If yes, render the signup form again with the errors and the user input
  res.render("adminCategoryManagement2Edit", { errors: errors,categories,categoryName});
}else {
  // If no, check if the email already exists in the database
  const data = await Category.findOne({ name: categoryName});
    if (data) {
      // If the email already exists, render the signup form again with an error message
     
      res.render("adminCategoryManagement2", { errors: errors,categories});
    }else{
      const result =  await Category.updateOne({_id:req.query.categoryId},{$set:{name:categoryName}});
      const categories = await Category.find().sort({name:1});
      return  res.render("adminCategoryManagement2",{ errors: errors,categories});
    }

  }

  }catch(error){  
    console.log(error)
    res.render("adminSideError");

  }
  

};

const loadAddProduct = async (req,res)=>{

  try{
      const errors = req.query.errors;
      const categories = await Category.find({unList:0}).sort({name:1});
      
      res.render("adminProductAdding2",{errors,categories});

  }catch(error){
      console.log(error);
      res.render("adminSideErrors");
  }
};


const addProduct = async(req,res)=>{

  try{

      const categories = await Category.find();
  var errors = [];

  try {
    //var imageArray = req.resizedImagePaths
    
    var colorArray = req.body.colors.split(",");
    var sizeArray = req.body.sizes.split(",");

    const { image1, image2, image3 } = req.files;
    
    const checkProduct = await Product.find({productName:req.body.productName});

    if (checkProduct.length > 0){
      errors.push({ msg: "this product already exist " });

    }

    var product = new Product({
      productName:      req.body.productName.toLowerCase(),
      category:         req.body.category,
      brand:            req.body.brand,
      colors:           colorArray,
      sizes:            sizeArray,
      description:      req.body.description,
      price:            req.body.price,
      date:Date.now(),
      image1: image1[0].filename, // Assuming multer stores the file name in the 'filename' property;
      image2:"",
      image3: "",
    });

    if(image2){
      product.image2= image2[0].filename
     };

     if(image3){
      product.image3= image3[0].filename
     };

     if (!product.productName.trim()) {
      errors.push({ msg: "Product Name is required" });
    }

    if (errors.length > 0) {
      return res.render("adminProductAdding2", { errors, categories });
    }

    const result = await product.save();

    for (let i = 0; i < result.colors.length; i++) {
      for (let j = 0; j < result.sizes.length; j++) {
        const stock = new Stock({
          productId: result._id,
          productColor: result.colors[i],
          productVariant: result.sizes[j],
        });

        await stock.save();
      }
    }

    console.log("Product added successfully: ", result);
    res.render("adminProductAdding2", { errors, categories });
  } catch (error) {
    console.error("Error adding product: ", error);
    res.status(400).render("adminProductAdding2", { errors, categories });
  }


  }catch(error){
    console.log(error);
    res.render("adminSideErrors");
  }
   

};

const unlistCategory = async (req,res)=>{
  try{

      const categoryName = req.params.categoryName;
      const category = await Category.find({name:categoryName});

      if(category){
          await Category.updateOne({name:categoryName},{$set:{unList:1}});

          res.redirect("/admin/categoryManagement");
      }

      


  }catch(error){
      console.log(error);
      res.render("adminSideErrors");
  }
};

const listCategory = async (req,res)=>{
  try{

      const categoryName = req.params.categoryName;
      const category = await Category.find({name:categoryName});

      if(category){
          await Category.updateOne({name:categoryName},{$set:{unList:0}});

          res.redirect("/admin/categoryManagement");
      }

      


  }catch(error){
      console.log(error);
      res.render("adminSideErrors");
  }
};



const loadAllProducts = async(req,res)=>{
  try{

    const page = parseInt(req.query.page) || 1; // Default to page 1
    const pageSize = 7; // Number of products per page

    const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageSize);

    var products = await Product.find()
    .sort({productName:1})
    .limit(pageSize)
    .skip((page - 1) * pageSize);


    res.render("adminAllProducts",{products,currentPage:page, totalPages})


  }catch(error){
    console.log(error);
    res.render("adminSideErrors");
  }
};

const loadProductEdit = async(req,res)=>{
  try {
    var errors = [];
    const categories = await Category.find({ unList: 0 }).sort({ name: 1 });

    const id = req.query.productId; 
    
    console.log("item is " + id);

    const product = await Product.findOne({ _id: id });

    console.log("product is ", product); 

    res.render("adminProductEdit", { errors, categories, product });
} catch (error) {
    console.log(error); 
    res.render("adminSideErrors");
}};

const editProduct = async (req,res)=>{
  try{

    var errors = [];
    const categories = await Category.find({unList:0}).sort({name:1});

   

    const productId = req.query.productId;

    var product = await Product.findOne({_id:productId});

    const checkProduct = await Product.find({productName:req.body.productName});

    if (!product.productName==req.body.productName&&checkProduct){
      errors.push({ msg: "this product already exist " });

    }

    if (!product.productName.trim()) {
      errors.push({ msg: "Product Name is required" });
    }
  
    if (errors.length > 0) {
      return res.render("adminProductEdit",{errors,categories,product});
  
    }else{
     
      if (req.body.productName){
        await Product.updateOne({_id:productId},{$set:{productName:req.body.productName}});
      };
      if (req.body.category){
        await Product.updateOne({_id:productId},{$set:{category:req.body.category}});
      };
      if (req.body.brand){
        await Product.updateOne({_id:productId},{$set:{brand:req.body.brand}});
      };
      if (req.body.quantity){
        await Product.updateOne({_id:productId},{$set:{quantity:req.body.quantity}});
      };
     
      if (req.body.description){
        await Product.updateOne({_id:productId},{$set:{description:req.body.description}});
      };
      if (req.body.price){
        await Product.updateOne({_id:productId},{$set:{price:req.body.price}});
      };
     
      if (req.body.image2Status==1){
        await Product.updateOne({_id:productId},{$set:{image2:""}});
      };
  
      if (req.body.image3Status==1){
        await Product.updateOne({_id:productId},{$set:{image3:""}});
      };
  
      if (req.files.image1) {
        await Product.updateOne({_id:productId},{$set:{image1:req.files.image1[0].filename}});
      };
  
      if (req.files.image2) {
        await Product.updateOne({_id:productId},{$set:{image2:req.files.image2[0].filename}});
      };
      if (req.files.image3) {
        await Product.updateOne({_id:productId},{$set:{image3:req.files.image3[0].filename}});
      };
      
      
      var product = await Product.findOne({_id:productId});

      return res.redirect("/admin/allProducts"); 
    }

  }catch(error){
    console.log(error);
    res.render("adminSideErrors");
  }
};

const unlistProduct = async (req,res)=>{
  try{

    const productId = req.params.productId;

    console.log("unList product is "+ productId);

      const product = await Product.find({_id:productId});

      if(product){
          await Product.updateOne({_id:productId},{$set:{unList:1}});

          res.redirect("/admin/allProducts");
      }


  }catch(error){

    console.log(error);
    res.render("adminSideErrors");

  }
};

const listProduct = async (req,res)=>{
  try{

    const productId = req.params.productId;

    console.log("unList product is "+ productId);

      const product = await Product.find({_id:productId});

      console.log("product is "+product);

      if(product){
          await Product.updateOne({_id:productId},{$set:{unList:0}});

          res.redirect("/admin/allProducts");
      }

  }catch(error){

    console.log(error);
    res.render("adminSideErrors");

  }
};
module.exports = {
  loadCategoryManagement,
  loadAddProduct,
  addCategory,
  addProduct,
  loadCategoryManagementEdit,
  editCategory,
  unlistCategory,
  listCategory,
  loadAllProducts,
  loadProductEdit ,
  editProduct,
  unlistProduct,
  listProduct
  }