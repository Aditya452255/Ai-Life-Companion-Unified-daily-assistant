const express = require('express');
const router = express.Router();
const Health = require('../models/healthmodel');
const auth = require('../middleware/auth');

// Add a new health record (accepts { water, sleep, exercise })
// Protected: add health record for logged-in user
router.post('/', auth, async (req, res) => {
  const { water = 0, sleep = 0, exercise = 0 } = req.body;
  try {
    const record = new Health({ water, sleep, exercise, user: req.user.id });
    await record.save();
    res.json({ status: 'success', message: 'Health record added successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get all health records
// Protected: get records for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const records = await Health.find({ user: req.user.id }).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
