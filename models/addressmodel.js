
const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const addressSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      shippingEmail: {
        type: String,
        required: true,
      },
      mobile: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      postalCode: {
        type: Number,
        required: true,
      }
      
    
});


module.exports = mongoose.model('Address', addressSchema);