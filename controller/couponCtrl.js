const { json } = require("body-parser");
const Coupons = require ("../models/couponModel");
const User = require("../models/userModel");


const checkCoupon = async (req,res)=>{
    try{

        const currentDate = new Date();
        await Coupons.deleteMany({ endsOn: { $lt: currentDate } });

        const user = req.session.user;

        const couponId = req.body.couponId;

        const total = req.body.total;
        console.log("total is ",total);
       
        console.log("Coupon ID is " + couponId);
       
        
 
        const coupon = await Coupons.findOne({_id:couponId});

        console.log("coupon is "+coupon);
        
        if (coupon) {
            if (coupon.users.includes(user)) {
                res.json({fail:true,  message: 'already applied' });
            } else {
                if(total<coupon.startsAt){
                    res.json({fail:true,  message: 'you can apply this coupon from from Rs:'+coupon.startsAt});
                }else{
                    if((total*coupon.off)/100 > coupon.maxOff){

                        var totalAmountAfterCoupon = total- coupon.maxOff;
                        console.log("total amount from maxOff",totalAmountAfterCoupon)

                        res.json({ success: true, message: 'you will get only Rs:'+coupon.maxOff+" off by this coupon.. it is added successfully..",couponOff:coupon.off,couponId:coupon._id,saveByCoupon:coupon.maxOff,totalAmountAfterCoupon:totalAmountAfterCoupon });

                    }else{

                        const saveByCoupon = Math.round( (total*coupon.off)/100);

                        console. log('save by coupon from backend is '+saveByCoupon);

                        var totalAmountAfterCoupon = total- saveByCoupon;
                        console.log("total amount from Math",totalAmountAfterCoupon)

                        res.json({ success: true, message: 'Coupon applied successfully..you save Rs:'+saveByCoupon,couponOff:coupon.off,couponId:coupon._id,saveByCoupon:saveByCoupon,totalAmountAfterCoupon:totalAmountAfterCoupon});
                    }
                }
                
            }
           
        } else {
            res.json({ fail:true, message: 'Coupon not found.Try another one' });
        }

    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = {
    checkCoupon,
}