const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user:{
        type:String,
        required:true,
       
    },
    transactions:{
        type:Array,
    } 
    
});


module.exports = mongoose.model('Wallet', walletSchema);