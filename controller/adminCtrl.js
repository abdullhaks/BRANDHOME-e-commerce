const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const Sales = require("../models/salesModel");
const Orders = require("../models/orderModel");


const loadLogin = async (req,res)=>{

    try{
        const errors = req.query.errors;
        res.render("adminLogin",{errors});

    }catch(error){
        console.log(error);
        res.status(500).json({ success: false, msg: "An error occurred." });
       
    }
};

const verifyLogin = async (req,res)=>{

    try{


    const email = req.body.email;
    const password = req.body.password;

    var errors = [];

    if (!email) {
        errors.push({ msg: "Email is required  " });
      } else if (!validator.isEmail(email)) {
        errors.push({ msg: "Email is invalid  " });
      }else if (!email.endsWith("com")) {
        errors.push({ msg: "Email is invalid  " });
      }


      if (!password) {
        errors.push({ msg: "Password is required  " });
      } else if (password.length < 6) {
        errors.push({ msg: "Password should be at least 6 characters  " });
      }

      if (errors.length > 0) {
        // If yes, render the signup form again with the errors and the user input
        res.render("adminLogin",{ errors: errors, email:email, password:password});
      } else {
        // If no, check if the email already exists in the database
        const data = await User.findOne({ email: email })
          if (!data) {
            // If the email already exists, render the signup form again with an error message
            errors.push({ msg: "no account with this email " });
            res.render("adminLogin",{ errors: errors,  email:email, password:password});
          } else {
            // If the email does not exist, create a new user and save it to the database
        
                if(data.is_admin===1){
                    const passwordMatch = await bcrypt.compare(password,data.password);

                    if(passwordMatch){

                            req.session.admin_Id = data._id;
                            req.session.isAdmin = true;
                            res.redirect("/admin/home");

                      
                     }else{
                      errors.push({ msg: "incorrect password " });
                        res.render("adminLogin",{errors: errors,  email:email, password:password});
                     }

                   
                }else{

                    errors.push({ msg: "no account with this email  " });
                    res.render("adminLogin",{errors: errors,  email:email, password:password});
                }
            
           
        }
        }}
        catch(error){
        console.log(error);
        res.status(500).json({ success: false, msg: "An error occurred." });
    }
};


const loadDashBoard = async (req,res)=>{ 

    try{

        const currentDate = new Date();
        const filterDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

        console.log("filter date is ",filterDate);

        const   sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });

        console.log("sales is ",sales);
        const filter = "week"

        const result = await Sales.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$purchaseDetails.quantity" },
                    totalDiscount: { $sum: "$purchaseDetails.youSave" } 
                }
            }
        ]);

        const overallSalesCount = result.length > 0 ? result[0].totalSales : 0;
        const overallDiscount = result.length > 0 ? result[0].totalDiscount : 0;
        console.log("Overall Sales Count:", overallSalesCount);
        console.log("Overall Discount:", overallDiscount);


        const orderCount = await Orders.countDocuments({
            cancelledDate: { $exists: false }, 
            returnStatus: { $ne: 2 }, 
            $or: [
                { paymentOption: "cash on delivery" }, 
                { paymentOption: { $ne: "cash on delivery" }, paymentStatus: 1 } 
            ]
        });

        console.log("Overall Order Count:", orderCount);

        const totalUsers = await User.countDocuments({});

        console.log("totaouserss",totalUsers);

        

        res.render("adminhome2",{overallSalesCount,overallDiscount,orderCount,totalUsers,sales});
    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const logout = async (req,res)=>{

    try{

        req.session.destroy();
        res.redirect("/admin")

    }catch(error){
        console.log(error);
        res.status(500).json({ success: false, msg: "An error occurred." });
    }
};


const userManagement = async (req,res)=>{
    try{


        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 8; // Number of products per page

        const totalUsers = await User.countDocuments({is_admin:0});
        const totalPages = Math.ceil(totalUsers / pageSize);
        
        const usersData = await User.find({is_admin:0})
        .sort({name:1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);

        res.render("adminUserManagement2" ,{users:usersData, currentPage:page, totalPages});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};


const blockUser = async (req,res)=>{
    try{

        const id = req.query.id;
        const user = await User.find({_id:id});

        if(user){
            await User.updateOne({_id:id},{$set:{is_blocked:1}});

            res.json({ success: true, userId: id });
        }

        
  

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const unblockUser = async (req,res)=>{
    try{

        const id = req.query.id;
        const user = await User.find({_id:id});

        if(user){
            await User.updateOne({_id:id},{$set:{is_blocked:0}});

            res.json({ success: true, userId: id });
        }

       
  

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};




module.exports = {
    loadLogin,
    verifyLogin,
    loadDashBoard,
    logout,
    userManagement,
    blockUser,
    unblockUser,
    
}