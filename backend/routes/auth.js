const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/usermodel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if(!name || !email || !password) return res.status(400).json({ status:'error', message:'name, email and password required' });
  try{
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ status:'error', message:'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hash });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ status:'success', token, user: { id:user._id, name:user.name, email:user.email, phone:user.phone } });
  }catch(err){
    res.status(500).json({ status:'error', message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ status:'error', message:'email and password required' });
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ status:'error', message:'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({ status:'error', message:'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ status:'success', token, user: { id:user._id, name:user.name, email:user.email, phone:user.phone } });
  }catch(err){
    res.status(500).json({ status:'error', message: err.message });
  }
});

module.exports = router;
