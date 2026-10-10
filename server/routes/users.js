const router = require('express').Router();
const User = require('../models/User');
const Adoption = require('../models/Adoption');
const Review = require('../models/Review');
const Pet = require('../models/Pet');
const { wrap, protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/', wrap(async (req, res) => res.json({ users: await User.find().select('-password').sort('-createdAt') })));
router.put('/:id/role', wrap(async (req, res) => {
  if (!['user', 'admin'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid role' });
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot change your own role' });
  res.json({ user: await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password') });
}));
router.delete('/:id', wrap(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account' });
  const pending = await Adoption.find({ user: req.params.id, status: 'Pending' });
  await Pet.updateMany({ _id: { $in: pending.map(a => a.pet) } }, { status: 'Available' });
  await Promise.all([Adoption.deleteMany({ user: req.params.id }), Review.deleteMany({ user: req.params.id }), User.findByIdAndDelete(req.params.id)]);
  res.json({ message: 'User deleted' });
}));
module.exports = router;
