const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { wrap, sign, protect } = require('../middleware/auth');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const out = u => ({ id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, city: u.city, bio: u.bio });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Enter your full name' });
  if (!emailRe.test(email || '')) return res.status(400).json({ message: 'Enter a valid email address' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user._id), user: out(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.password)))
    return res.status(401).json({ message: 'Incorrect email or password' });
  res.json({ token: sign(user._id), user: out(user) });
}));

router.get('/me', protect, (req, res) => res.json({ user: out(req.user) }));

router.put('/me', protect, wrap(async (req, res) => {
  const { name, phone, city, bio, password } = req.body;
  const user = await User.findById(req.user._id);
  if (name !== undefined) { if (name.trim().length < 2) return res.status(400).json({ message: 'Enter your full name' }); user.name = name; }
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (bio !== undefined) user.bio = bio;
  if (password) { if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' }); user.password = await bcrypt.hash(password, 10); }
  await user.save();
  res.json({ user: out(user) });
}));

module.exports = router;
