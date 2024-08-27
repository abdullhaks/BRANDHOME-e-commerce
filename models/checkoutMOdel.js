const mongoose = require('mongoose');

const checkOutSchema = new mongoose.Schema({
    user:{
        type:String,
        required:true,
       
    },
    products:{
        type:Array,
       
    },
    totalAmount:{
        type:Number,
    },
    totalOffer:{
        type:Number,
    },
    subTotal:{
        type:Number,
    }
    
});


module.exports = mongoose.model('CheckOut', checkOutSchema);