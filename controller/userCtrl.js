const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const WishList = require("../models/wishListModel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nocache = require('nocache');
const Category = require("../models/categorymodel");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');



const securePassword = async(password)=>{

    try{
       const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword;
    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};

const loadRegister = async(req,res)=>{

  try{

  var nameErrors = [];
  var emailErrors = [];
  var passwordErrors = [];
  var confirmPasswordErrors = [];
  var mobileErrors = [];
  var name; var email; var password; var confirmPassword; var mobile

     res.render("signin", { nameErrors,emailErrors,passwordErrors,confirmPasswordErrors,mobileErrors,
      name, email, password, confirmPassword, mobile });

  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
   
  }

}

  



const verifyRegister = async (req,res)=> {

    try{

       
        
       const user = new User ({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            confirmPassword:req.body.confirmPassword,
            mobile:req.body.mobile,
        });
         // Validate the user input
  var nameErrors = [];
  var emailErrors = [];
  var passwordErrors = [];
  var confirmPasswordErrors = [];
  var mobileErrors = [];

  // Name validation
    const nameInput = user.name.trim()
  if (!nameInput) {
    nameErrors.push({ msg: "Name is required" });
  } else if (!/^[a-zA-Z\s]+$/.test(user.name)) {
    nameErrors.push({ msg: "Name should not contain special keys  " });
  } else if (user.name.length < 5) {
    nameErrors.push({ msg: "name should be at least 5 characters  " });
  } else if (user.name.length > 20) {
    nameErrors.push({ msg: "name should not be 20+ characters  " });
  }

  // Email validation
  if (!user.email) {
    emailErrors.push({ msg: "Email is required  " });
  } else if (!validator.isEmail(user.email)) {
    emailErrors.push({ msg: "Email is invalid  " });
  }else if (!user.email.endsWith("com")) {
    emailErrors.push({ msg: "Email is invalid  " });
  }

  // Password validation
  if (!user.password) {
    passwordErrors.push({ msg: "Password is required  " });
  } else if (user.password.length < 6) {
    passwordErrors.push({ msg: "Password should be at least 6 characters  " });
  }

  // Confirm password validation
  if (!user.confirmPassword) {
    confirmPasswordErrors.push({ msg: "Confirm password is required  " });
  } else if (user.confirmPassword !== user.password) {
    confirmPasswordErrors.push({ msg: "Passwords do not match  " });
  }

  // Mobile validation
  if (!user.mobile) {
    mobileErrors.push({ msg: "Mobile is required  " });
  } else if (!/^\d{10}$/.test(user.mobile)) {
    mobileErrors.push({ msg: "Mobile should be 10 digits  " });
  }

  // Check if there are any errors
  if (nameErrors.length > 0||emailErrors.length > 0||passwordErrors.length > 0||confirmPasswordErrors.length > 0||mobileErrors.length > 0) {
    // If yes, render the signup form again with the errors and the user input
    res.render("signin", { nameErrors,emailErrors,passwordErrors,confirmPasswordErrors,mobileErrors,
      name: user.name, email: user.email, password: user.password, confirmPassword: user.confirmPassword, mobile: user.mobile });
  } else {
    // If no, check if the email already exists in the database  
    const data = await User.findOne({ email: user.email })
      if (data) {
        // If the email already exists, render the signup form again with an error message
        emailErrors.push({ msg: "Email already registered  " });
        res.render("signin", { nameErrors,emailErrors,passwordErrors,confirmPasswordErrors,mobileErrors,
          name: user.name, email: user.email, password: user.password, confirmPassword: user.confirmPassword, mobile: user.mobile });
      } else {
        // If the email does not exist, create a new user and save it to the database
        const spassword = await securePassword(req.body.password);
        user.password=spassword; 
        const sCONFpassword = await securePassword(req.body.confirmPassword);
        user.confirmPassword=sCONFpassword;
        


        const result = await user.save();

        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , lowerCaseAlphabets:false});

        const otp = new Otp ({
          email:user.email,
          otp:OTP

        });

        const otpResult = await otp.save();

       

        const mailOptions = {
          from:"muthuab786@gmail.com",
          to:otp.email,
          subject:"WELCOME TO BRANDHOME... ",
          text:"Hi "+user.name+", This is your OTP : "+otp.otp

        }

        mail.sendMail(mailOptions);

          var errors = []

          return  res.render("otp",{errors,user});
          
       
    }
    };
  }catch(error){
    res.send(error.message);
    res.status(500).json({ error: "Internal Server Error" });
}
};
  


      

       

       
     

    


const loadLogin = async (req,res)=>{

    try{
      var emailErrors = [];
      var passwordErrors = [];
      var email; var password;

       return res.render("login",{emailErrors,passwordErrors,email,password});

    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const verifyLogin = async (req,res)=>{
    try{

        const email = req.body.email;
        const password = req.body.password;

        var errors = [];
        var emailErrors = [];
        var passwordErrors = [];

        if (!email) {
          emailErrors.push({ msg: "Email is required  " });
          } else if (!validator.isEmail(email)) {
            emailErrors.push({ msg: "Email is invalid  " });
          }else if (!email.endsWith("com")) {
            emailErrors.push({ msg: "Email is invalid  " });
          }


          if (!password) {
            passwordErrors.push({ msg: "Password is required  " });
          } else if (password.length < 6) {
            passwordErrors.push({ msg: "Password should be at least 6 characters  " });
          };

          if (emailErrors.length > 0||passwordErrors.length > 0) {
            // If yes, render the signup form again with the errors and the user input
            res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
          } else {
            // If no, check if the email already exists in the database
            const user = await User.findOne({ email: email })
              if (!user) {
                // If the email already exists, render the signup form again with an error message
                emailErrors.push({ msg: "no account with this email " });
                res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
              } else {
                // If the email does not exist, create a new user and save it to the database
            
                    if(user.is_admin===1){

                        emailErrors.push({ msg: "no account with this email  " });
                        res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
                    }else{

                        const passwordMatch = await bcrypt.compare(password,user.password);

                        if(passwordMatch){ 

                            if(user.is_blocked===1){
                                emailErrors.push({ msg: "this account is blocked  " });
                                res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
                            }else{
                              if(user.is_verified===1){
                                req.session.user_id = user._id
                               req.session.user = user.email;
                               req.session.isUser=true;

                               res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                               res.set('Expires', '-1');
                               res.set('Pragma', 'no-cache');

                                return  res.redirect("/home");
                              }else{
                                const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , lowerCaseAlphabets:false});

                                      const otp = new Otp ({
                                        email:user.email,
                                        otp:OTP

                                      });

                                  const otpResult = await otp.save();

 

                                      const mailOptions = {
                                        from:"muthuab786@gmail.com",
                                        to:otp.email,
                                        subject:"WELCOME TO BRANDHOME... ",
                                        text:"Hi, This is your OTP : "+otp.otp

                                      }

                                          mail.sendMail(mailOptions);

                                          

                                          return  res.render("otp",{errors,user});

                              }
                               
                            }
                          
                        
                         }else{
                          passwordErrors.push({ msg: "incorrect password " });
                          res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
                         }
                    }
                
               
            }
            }

    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loadHome = async (req,res)=>{
    try{
     
      var id = await req.session.user 

      const categories = await Category.find().sort({name:1});


      const cart = await Cart.findOne({email:id});

      var cartNo = 0;
      if(cart){
       cartNo = cart.products.length;
      };

      const wishList = await WishList.findOne({email:id});
        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        };

        const popularProduct = await Product.find({}).sort({ salesCount: -1 }).limit(8);
        const justArrived = await Product.find({}).limit(8);
        const popularCategory = await Category.find({}).sort({ salesCount: -1 }).limit(6)


      
      req.session.user_id = id
      req.session.user = id;
      req.session.isUser=true;

        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.set('Expires', '-1');
        res.set('Pragma', 'no-cache');
       
      return  res.render("home",{user:id,cartNo,categories,wishListNo,popularProduct,popularCategory,justArrived});

    }catch(error){
        console.log(error);
        return res.render("userSideErrors",{user:id,cartNo,wishListNo});
    }
};

const logout = async (req,res)=>{

    try{

        req.session.destroy();

        res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.set('Expires', '-1');
        res.set('Pragma', 'no-cache');

      return  res.redirect("/");

    }catch(error){
        console.log (error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const checkOtp = async (req,res)=>{
  try {
            var errors = [];
          const otp = req.body.otp;
          const email = req.body.data;

          
            console.log(email)
            

            console.log("otp is : "+otp);


    const user = await Otp.findOne({ email: email }).sort({ createdAt: -1 }).limit(1);;
    

    if(user){
      if(user.otp==otp){
        await User.updateOne({email:email},{$set:{is_verified:1}});

        req.session.user_id = user.email
      req.session.user = user.email;
      req.session.isUser=true;

      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.set('Expires', '-1');
      res.set('Pragma', 'no-cache');

        return res.redirect("/home")
      }else{
        errors.push({ msg: "incorrect otp " });
        res.render("otp",{errors,user});
      }
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal Server Error" });
  }




};

const resentOtp = async(req,res)=>{

  try{
    const email = req.params.email;

    console.log("resend otp is "+email)
  
    const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false , lowerCaseAlphabets:false});
  
    const otp = new Otp ({
      email:email,
      otp:OTP
  
    });
  
    const otpResult = await otp.save();
  
   
    var errors = [];
    const mailOptions = {
      from:"muthuab786@gmail.com",
      to:email,
      subject:"WELCOME TO BRANDHOME... ",
      text:"Hi, This is your OTP : "+otp.otp
  
    }
  
    mail.sendMail(mailOptions);
    const user = await User.findOne({ email: email })
    return  res.render("otp",{errors,user});
  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });

  }
  

};

const loadProducts = async (req, res) => {
  try {
      const user = req.query.email;
      var id = await req.session.user;

      const cart = await Cart.findOne({ email: id });

      const categories = await Category.find().sort({name:1});

      var cartNo = 0;
      if (cart) {
          cartNo = cart.products.length;
      }

      const wishList = await WishList.findOne({email:id});
    
        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

      const category = req.query.category;
      const search = req.query.search;
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const pageSize = 4; // Number of products per page

      let query = { unList: 0 }; // Default query

      if (category) {
          query.category = category;
      }

      if (search) {
        query.$or = [
            { productName: { $regex: new RegExp(search, 'i') } },  
            { category: { $regex: new RegExp(search, 'i') } },
            { brand: { $regex: new RegExp(search, 'i') } }
        ];
    }

      let sortQuery = {}; // Default sort
      const sortBy = req.query.sortBy;

      if (sortBy === 'latest') {
          sortQuery = { date: -1 }; // Sort by latest
      } else if (sortBy === 'popularity') {
          sortQuery = { salesCount: -1 }; // Sort by popularity 
      } else if (sortBy === 'Price-low to high') {
          sortQuery = { price: 1 }; // Sort by best rating
      } else if (sortBy === 'Price-high to low') {
        sortQuery = { price: -1 }; // Sort by best rating
    }
    
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / pageSize);

      const products = await Product.find(query)
          .sort(sortQuery) // Apply sorting
          .limit(pageSize)
          .skip((page - 1) * pageSize);

      res.render("products", {
          products,
          user: id,
          cartNo,
          wishListNo,
          category,
          search,
          sortBy,
          currentPage: page,
          totalPages,
          categories
      }); 

  } catch (error) {
      console.log(error);
      return res.render("userSideErrors",{user:id,cartNo,wishListNo});
  }
};

const loadProductsDetails = async (req,res)=>{
  try{

    var user = await req.session.user 

    const cart = await Cart.findOne({email:user});
    
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
   
    const productId= req.query.productId

    console.log("product name is"+productId)
    const product = await Product.findOne({_id:productId});
    console.log("product  is"+product)
   
     
    return  res.render("productDetails",{product,user,cartNo,wishListNo});

  }catch(error){
      console.log(error);
      
       res.render("userSideErrors",{user,cartNo,wishListNo})
  }
};

const loadForgetPassword = async (req,res)=>{
  try{
    let errors =[];
    return res.render("forgetPassword",{ errors});

  }catch(error){

      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
  }

};

const checkemail = async (req,res)=>{
  try{
    const email = req.body.email;

    var errors = [];

    if (!email) {
        errors.push({ msg: "Email is required  " });
      } else if (!validator.isEmail(email)) {
        errors.push({ msg: "Email is invalid  " });
      }else if (!email.endsWith("com")) {
        errors.push({ msg: "Email is invalid  " });
      }

      if (errors.length > 0) {
        // If yes, render the signup form again with the errors and the user input
        res.render("forgetPassword", { errors: errors});
      } else {
        // If no, check if the email already exists in the database
        const data = await User.findOne({ email:email })
          if (!data) {
            // If the email already exists, render the signup form again with an error message
            errors.push({ msg: "There is no account with this email " });
            res.render("forgetPassword", { errors: errors});
          } else {
           
    
    
           
    
            const OTP = otpGenerator.generate(8, {  specialChars: false});
    
            const recoverypassword = new Recoverypassword ({
              email:email,
              otp:OTP
    
            });
    
            const recoverypasswordResult = await recoverypassword.save();
    
           
    
            const mailOptions = {
              from:"muthuab786@gmail.com",
              to:recoverypassword.email,
              subject:"WELCOME TO BRANDHOME... ",
              text:"Hi , This is your recovery password : "+recoverypassword.otp
    
            }
    
            mail.sendMail(mailOptions);
    
      
              return  res.render("recoveryPassword",{errors,email});
              
           
        }
        };

  }catch(error){
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editProfile = async (req,res)=>{
  try{
    var id =  req.session.user ;
    const cart = await Cart.findOne({email:id});

     var cartNo = 0;
    if(cart){
     cartNo = cart.products.length;
    }

    const wishList = await WishList.findOne({email:id});

        var wishListNo = 0;
        if(wishList){
        wishListNo = wishList.products.length;
        }

    const {name,mobile,userId}=req.body;

    console.log("name and userId and mobile is ",name,mobile,userId);

    const user =await User.findById(userId);
    user.name=name;
    user.mobile= mobile;

    await user.save();

    res.redirect("/profile");


  }catch(error){
    console.log(error);
    return res.render("userSideErrors",{user:id,cartNo,wishListNo});
  }
};


const changePassword = async (req, res) => {
  try {
      const { userId, currentPassword, newPassword,repeatPassword } = req.body;

      console.log("userId, currentPassword, newPassword:", userId, currentPassword, newPassword,repeatPassword);

      const user = await User.findById(userId);
      console.log("user:", user);

      if (!user) {
          return res.json({ success: false, msg: "User not found." });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      console.log("passwordMatch:", passwordMatch);

      if (passwordMatch) {
        const spassword = await securePassword(newPassword);
        user.password=spassword; 
        const sCONFpassword = await securePassword(repeatPassword);
        user.confirmPassword=sCONFpassword;

        await user.save();

          res.json({ success: true, msg: "Password successfully changed." });
          console.log("Password successfully changed.");
          
      } else {
          res.json({ success: false, msg: "Wrong current password." });
          console.log("Wrong current password.");
      }

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false, msg: "An error occurred." });
  }
};



 

module.exports = {
    loadRegister,
    verifyRegister,
    loadLogin,
    verifyLogin,
    loadHome ,
    logout,
    checkOtp,
    resentOtp,
    loadProducts,
    loadProductsDetails,
    loadForgetPassword,
    checkemail,
    editProfile,
    changePassword,
        };