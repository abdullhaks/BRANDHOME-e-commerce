
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
      },
    category:{
        type:String,
        required: true,
      },
    brand:{
        type:String,
        required:true,
    },
    colors: {
        type: Array,
        required: true,
      },
    sizes:{
        type: Array,
        required: true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    totalStock:{
      type:Number,
      default:0,
  },
    productOfferPercentage:{
        type:Number,
        default:0,
    },
    categoryOfferPercentage:{
      type:Number,
      default:0,
    },
    image1: {
        type: String,
        required:true,
    },
    image2: {
        type: String,
        
    },
    image3: {
        type: String,
      
    },
    unList:{
        type:Number,
        default:0
    },
    salesCount:{
      type:Number,
      default:0
    },
    date:{
      type:String,
      required:true,
  },

      
});


module.exports = mongoose.model('Product', productSchema);