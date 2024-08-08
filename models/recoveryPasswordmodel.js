const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
const recoverypasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
      },
      otp: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 3, // The document will be automatically deleted after 3 minutes of its creation time
      }
    
});


module.exports = mongoose.model('Recoverypassword', recoverypasswordSchema);