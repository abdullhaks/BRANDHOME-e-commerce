
const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const salesSchema = new mongoose.Schema({

    orderObjectId:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        required:true,
       
    },
    orderId:{
        type:String,
        required:true,
    } ,
    purchaseDetails:{
        type:Object,
        required:true,
    } ,
    address:{
        type:Object,
        required:true,
    } ,
    paymentOption:{
        type:String,
        required:true,
    } ,
    paymentStatus:{
        type:Number,
        default:0,
        
    } ,
    transactionId:{
        type:String,
    },
    orderDate:{
        type:String,
        required:true,
    },
    dispatchedDate:{
        type:String,
        
    },
    deliveredDate:{
        type:Date,
        
    },
    
    deliverTime:{
        type:String,
    },
  
    orderTime:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"pending",
        
    } ,
    returnCanceledOn:{
        type:Number,
    },
    returnStatus:{
        type:Number,
        default:0,
        
    } ,
    grandTotal:{
        type:Number,
    },
   
    
});
 

 
module.exports = mongoose.model('Sale', salesSchema); 