
const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
       
    },
    orderId:{
        type:String,
        required:true,
    } ,
    items:{
        type:Array,
        required:true,
    } ,
    address:{
        type:Object,
        required:true,
    } ,
    paymentOption:{
        type:String,
        required:true,
    } ,
    grandTotal:{
        type:Number,
        required:true,
    },
    paymentStatus:{
        type:Number,
        default:0,
        
    } ,
    transactionId:{
        type:String,
    },
    orderDate:{
        type:Date,
        required:true,
    },
    
});
 

 
module.exports = mongoose.model('Order', orderSchema); 