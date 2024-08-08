const Coupons = require ("../models/couponModel");

const loadAdminCouponManagement = async (req,res)=>{
    try{

        let coupon = {};
        const errors = [];
        const coupons = await Coupons.find();

        res.render("adminCoupons",{coupons,errors,coupon});

    }catch(error){
        console.log(error);
    }
};


const addCoupon = async (req,res)=>{
    try{


       
       
        const coupons = await Coupons.find();
        var coupon = new Coupons ({
            couponName:req.body.coupon,
            description:req.body.description,
            off:req.body.off,
            maxOff:req.body.maxOff,
            startsAt:req.body.startsAt,
            

           
        });

        console.log ("coupon is "+coupon);
        
        var errors = [];

 
        const nameInput = coupon.couponName.trim()
        if (!nameInput||nameInput.length<3) {
          errors.push({ msg: "Name is required/at least 3 letter required" });
         }

//else if (!/^[a-zA-Z\s]+$/.test(CategoryName.name)) {
//     errors.push({ msg: "Name should not contain special keys  " });
//   };

        const descriptionInput = coupon.description.trim()
        if (!descriptionInput||descriptionInput.length<5) {
        errors.push({ msg: "description is required/at least 5 letter required" });
        }

  if (errors.length > 0) {
    // If yes, render the signup form again with the errors and the user input
    res.render("adminCoupons",{coupons,errors,coupon});
  }else {
    // If no, check if the email already exists in the database
    const data = await Coupons.findOne({ name: coupon.couponName });
      if (data) {
        // If the email already exists, render the signup form again with an error message
        errors.push({ msg: "coupon already entered  " });
        res.render("adminCoupons",{coupons,errors,coupon});
      }else{
        const result = await coupon.save();
        const coupons = await Coupons.find().sort({name:1});
        coupon = {};
        return  res.render("adminCoupons",{coupons,errors,coupon});
      }

    }

    }catch(error){
        console.log(error);
    }
}



module.exports = {
    loadAdminCouponManagement,
    addCoupon
}