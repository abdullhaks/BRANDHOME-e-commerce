const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const couponSchema = new mongoose.Schema({ 
    couponName:{
        type:String,
        required:true,
       
    },
    description:{
        type:String,
       
       
    },
    maxOff:{
        type:Number
    },
    startsAt:{
        type:Number
    },
    off:{
        type:Number,
        
    } ,
    users:{
        type:Array,
    },
    endsOn:{
        type:Date,
    }
    
});


module.exports = mongoose.model('Coupon', couponSchema);