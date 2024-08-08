const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({ 
    name:{
        type:String,
        required:true,
       
    },
    email:{
        type:String,
        required:true,
        
    },
    mobile:{
        type:String,
       
    },
    password:{
        type:String,
        
    },
    confirmPassword:{
        type:String,
        
    },
    is_admin:{

        type:Number,
        default:0
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_blocked:{
        type:Number,
        default:0
    },
    googleId:{
        type:String,
    },
    totalPurchase:{
        type:Number,
        default:0
    },  
    wallet:{
        type:Number,
        default:0
    }, 
});


module.exports = mongoose.model('User', userSchema);