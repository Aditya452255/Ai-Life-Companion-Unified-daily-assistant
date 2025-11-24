 const mongoose = require('mongoose');

// Define the schema for recipes
const recipeSchema = new mongoose.Schema({
  name: String,                     // Name of the recipe
  ingredients: [String],            // List of ingredients
  nutrients: {                      // Nutritional information
    protein: Number,
    carbs: Number,
    fats: Number
  },
  instructions: String              // Steps to prepare the recipe
});

// Export the model to use in routes
module.exports = mongoose.model('Recipe', recipeSchema);
