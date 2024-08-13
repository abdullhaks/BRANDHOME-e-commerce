const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const adminCredentialsSchema = new mongoose.Schema({
    totalUsers:{
        type:Number,
      
       
    },
    overallOrders:{
        type:Number,
       
        
    },
    overallsales:{
        type:String,
        required:true,
        
    },
    stock:{
        type:Number,
        default:0,
    }

    
});


module.exports = mongoose.model('adminCredential', adminCredentialsSchema);