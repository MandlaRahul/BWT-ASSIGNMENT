const router = require('express').Router();
const Message = require('../models/Message');
const { wrap, protect, adminOnly } = require('../middleware/auth');

router.post('/', wrap(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !message || message.trim().length < 10)
    return res.status(400).json({ message: 'Fill in your name, a valid email and a message of at least 10 characters' });
  await Message.create({ name, email, subject, message });
  res.status(201).json({ message: 'Message sent' });
}));
router.get('/', protect, adminOnly, wrap(async (req, res) => res.json({ messages: await Message.find().sort('-createdAt') })));
router.delete('/:id', protect, adminOnly, wrap(async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));
module.exports = router;
