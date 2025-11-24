 const mongoose = require('mongoose');

// Define the schema for expenses (added `name` to store item name)
const expenseSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  amount: { type: Number, required: true },          // Amount spent
  category: { type: String, default: 'Other' },      // Category like Food, Travel, Shopping
  date: { type: Date, default: Date.now },           // Date of the expense
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
});

// Export the model to use in routes
module.exports = mongoose.model('Expense', expenseSchema);
