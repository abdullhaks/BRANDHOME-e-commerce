const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const stockSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true,
       
    },
    productColor:{
        type:String,
        required:true,
        
    },
    productVariant:{
        type:String,
        required:true,
        
    },
    stock:{
        type:Number,
        default:0,
    }

    
});


module.exports = mongoose.model('Stock', stockSchema);