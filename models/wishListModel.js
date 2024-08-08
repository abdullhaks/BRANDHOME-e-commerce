const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const wishListSchema = new mongoose.Schema({ 
    email:{
        type:String,
        required:true,
       
    },
    products:{
        type:Array,
        
    } 
    
});


module.exports = mongoose.model('WishList', wishListSchema);