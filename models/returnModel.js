const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const returnSchema = new mongoose.Schema({
    orderId:{
        type:String,
    },
    index:{
        type:Number
    },
    user:{
        type:String,
    },
    item:{
        type:Object,
    },
    requestDate:{
        type:Date,
     
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