 const mongoose = require('mongoose');

// Define the schema for health records to match frontend payloads
const healthSchema = new mongoose.Schema({
  water: { type: Number, default: 0 },    // glasses of water
  sleep: { type: Number, default: 0 },    // hours of sleep
  exercise: { type: Number, default: 0 }, // minutes of exercise
  date: { type: Date, default: Date.now }, // Date when record was added
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
});

// Export the model to use in routes
module.exports = mongoose.model('Health', healthSchema);
