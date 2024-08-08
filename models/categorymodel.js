const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
       
    },
    unList:{
        type:Number,
        default:0
    },
    categoryOfferPercentage:{
        type:Number,
        default:0,
    },
    
});


module.exports = mongoose.model('Category', categorySchema);