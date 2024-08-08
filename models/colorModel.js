const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const colorSchema = new mongoose.Schema({
    colorName:{
        type:String,
        required:true,
       
    },
    unList:{
        type:Number,
        default:0
    } 
    
});


module.exports = mongoose.model('Color', colorSchema);