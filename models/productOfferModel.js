const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const productOfferSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true,
       
    },
    productName:{
        type:String,
        required:true,
       
    },
    offerPercentage:{
        type:Number,
        
    },
    
    
});


module.exports = mongoose.model('Product Offer', productOfferSchema);