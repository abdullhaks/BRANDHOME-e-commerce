const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const optionSchema = new mongoose.Schema({
    optionName:{
        type:String,
        required:true,
       
    },
    unList:{
        type:Number,
        default:0
    } 
    
}); 


module.exports = mongoose.model('Option', optionSchema); 