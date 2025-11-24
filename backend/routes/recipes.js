const express = require("express");
const router = express.Router();

// AI Recipe generator (simple demo)
router.post("/", (req, res) => {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ message: "Goal is required" });
  }

  const highProteinRecipes = [
    "Grilled Chicken + Quinoa",
    "Paneer Bhurji + Roti",
    "Egg Omelette + Peanut Salad"
  ];

  const lowCalRecipes = [
    "Oats + Fruits Bowl",
    "Vegetable Soup",
    "Sprouts Salad"
  ];

  if (goal === "high_protein") {
    return res.json({ recipes: highProteinRecipes });
  }

  if (goal === "low_calorie") {
    return res.json({ recipes: lowCalRecipes });
  }

  return res.json({ message: "No matching goal" });
});

module.exports = router;