const Coupons = require ("../models/couponModel");

const loadAdminCouponManagement = async (req,res)=>{
    try{


      const currentDate = new Date();
      await Coupons.deleteMany({ endsOn: { $lt: currentDate } });


        let coupon = {};
        const errors = [];
        const coupons = await Coupons.find();

        res.render("adminCoupons",{coupons,errors,coupon});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
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
            endsOn:req.body.endsOn,

           
        });

        console.log ("coupon is "+coupon);
        
        var errors = [];

 
        const nameInput = coupon.couponName.trim()
        if (!nameInput||nameInput.length<3) {
          errors.push({ msg: "Name is required/at least 3 letter required" });
         }



        const descriptionInput = coupon.description.trim()
        if (!descriptionInput||descriptionInput.length<5) {
        errors.push({ msg: "description is required/at least 5 letter required" });
        }

  if (errors.length > 0) {
    // If yes, render the signup form again with the errors and the user input
    res.render("adminCoupons",{coupons,errors,coupon});
  }else {
    // If no, check if the email already exists in the database
    const data = await Coupons.findOne({ couponName: coupon.couponName });
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
        res.render("adminSideErrors");
    }
};


const deleteCoupon = async(req,res)=>{
  try{

    const {couponId} = req.body

    console.log("coupon id is ",couponId);

    const data=await Coupons.deleteOne({_id:couponId});
    console.log("data  is ",data);

    const coupons = await Coupons.find();
    console.log("coupons  is ",coupons);

    res.json({success:true,coupons});

  }catch(error){
console.log(error);
res.render("adminSideErrors");
  }
};


const editCoupon = async(req,res)=>{
  try{
console.log("body is",req.body);


const couponId = req.body.couponId;

console.log("coupon id is",couponId);



    var coupon = await Coupons.findById(couponId);
    console.log("coupon is",coupon);


    coupon.couponName=req.body.couponName;
    coupon.description=req.body.description;
    coupon.off=req.body.off;
    coupon.maxOff=req.body.maxOff;
    coupon.startsAt=req.body.startsAt;
    coupon.endsOn=req.body.endsOn;

     


  console.log ("coupon is "+coupon);
  
  var errors = [];


  const nameInput = coupon.couponName.trim()
  if (!nameInput||nameInput.length<3) {
    errors.push({ msg: "Name is required/at least 3 letter required" });
   }



  const descriptionInput = coupon.description.trim()
  if (!descriptionInput||descriptionInput.length<5) {
  errors.push({ msg: "description is required/at least 5 letter required" });
  }

if (errors.length > 0) {
// If yes, render the signup form again with the errors and the user input
return res.json({success:false,msg:"❗ space doesn't consider as a letter"});
}else {
// If no, check if the email already exists in the database
const existingCoupon = await Coupons.findOne({ couponName: coupon.couponName });
if (existingCoupon && existingCoupon._id.toString() !== couponId) {
  return res.json({ success: false, msg: "❗ Coupon name already exists" });
}


  const result = await coupon.save();
  res.json({success:true,msg:"coupon edited"});



}

  }catch(error){
      console.log(error);
  }

}




module.exports = {
    loadAdminCouponManagement,
    addCoupon,
    deleteCoupon,
    editCoupon,
}