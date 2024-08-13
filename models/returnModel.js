const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const returnSchema = new mongoose.Schema({
    orderId:{
        type:String,
    },
    user:{
        type:String,
    },
    productDetails:{
        type:String,
    },
    totalAmount:{
        type:Number,
       
    } ,
    dateString:{
        type:String,
    },
    returnDate:{
        type:String,
       
    },
    returnReason:{
        type:String,
    },
    returnStatus:{
        type:String,
        default:"pending"
    } 
    
});


module.exports = mongoose.model('Return', returnSchema);