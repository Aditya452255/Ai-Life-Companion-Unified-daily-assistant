const mongoose = require('mongoose');

// Define the schema for users
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },          // User's full name
  email: { type: String, required: true, unique: true },         // User's email
  phone: { type: String, required: false },
  password: { type: String, required: true }       // Hashed password
}, { timestamps: true });

// Export the model to use in routes
module.exports = mongoose.model('User', userSchema);
