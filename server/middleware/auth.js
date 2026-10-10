const jwt = require('jsonwebtoken');
const User = require('../models/User');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const secret = () => process.env.JWT_SECRET || 'dev_secret';
const sign = id => jwt.sign({ id }, secret(), { expiresIn: '7d' });

const protect = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Please log in to continue' });
  try {
    const { id } = jwt.verify(h.slice(7), secret());
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please log in again' }); }
});

const adminOnly = (req, res, next) =>
  req.user && req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });

module.exports = { wrap, sign, protect, adminOnly };
