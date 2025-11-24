const express = require('express');
const router = express.Router();
const Expense = require('../models/expensemodel');
const auth = require('../middleware/auth');

// Add a new expense (accepts { name, amount, category })
// Protected: add new expense (requires auth)
router.post('/', auth, async (req, res) => {
  const { name = '', amount, category = 'Other' } = req.body;
  if (amount == null) return res.status(400).json({ status: 'error', message: 'Amount is required' });
  try {
    const expense = new Expense({ name, amount, category, user: req.user.id });
    await expense.save();
    res.json({ status: 'success', message: 'Expense added successfully', expense, id: expense._id });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get all expenses
// Protected: get expenses for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
