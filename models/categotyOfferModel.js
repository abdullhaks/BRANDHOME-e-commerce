const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const categoryOfferSchema = new mongoose.Schema({
    categoryId:{
        type:String,
        required:true,
       
    },
    categoryName:{
        type:String,
        required:true,
       
    },
    offerPercentage:{
        type:Number,
        
    },
    
    
});


module.exports = mongoose.model('Category Offer', categoryOfferSchema);