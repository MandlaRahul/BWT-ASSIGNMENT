const router = require('express').Router();
const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const { wrap, protect, adminOnly } = require('../middleware/auth');

// CREATE: atomically reserve the pet so two people can never reserve it at once
router.post('/', protect, wrap(async (req, res) => {
  const { petId, phone, address, housing, experience, otherPets, reason, visitDate } = req.body;
  if (!/^[0-9+\-\s()]{7,15}$/.test(phone || '')) return res.status(400).json({ message: 'Enter a valid phone number' });
  if (!address || address.trim().length < 8) return res.status(400).json({ message: 'Enter your full address' });
  if (!reason || reason.trim().length < 20) return res.status(400).json({ message: 'Reason must be at least 20 characters' });
  if (!visitDate || new Date(visitDate) < new Date(new Date().toDateString())) return res.status(400).json({ message: 'Choose a meet-and-greet date from today onward' });

  // Only one request can flip Available -> Reserved; every other simultaneous request gets null
  const pet = await Pet.findOneAndUpdate({ _id: petId, status: 'Available' }, { status: 'Reserved' }, { new: true });
  if (!pet) return res.status(409).json({ message: 'Sorry, this pet was just reserved or is no longer available' });
  try {
    const adoption = await Adoption.create({ pet: pet._id, user: req.user._id, phone, address, housing, experience, otherPets, reason, visitDate });
    res.status(201).json({ adoption });
  } catch (e) {
    await Pet.findByIdAndUpdate(pet._id, { status: 'Available' }); // roll back the hold
    throw e;
  }
}));

// READ: my requests
router.get('/mine', protect, wrap(async (req, res) =>
  res.json({ adoptions: await Adoption.find({ user: req.user._id }).populate('pet', 'name breed image category status').sort('-createdAt') })));

// READ: all requests (admin)
router.get('/', protect, adminOnly, wrap(async (req, res) =>
  res.json({ adoptions: await Adoption.find().populate('pet', 'name breed image category status').populate('user', 'name email').sort('-createdAt') })));

// UPDATE: approve / reject (admin)
router.put('/:id/status', protect, adminOnly, wrap(async (req, res) => {
  const { status, adminNote } = req.body;
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const a = await Adoption.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Request not found' });
  a.status = status; if (adminNote !== undefined) a.adminNote = adminNote;
  await a.save();
  await Pet.findByIdAndUpdate(a.pet, { status: status === 'Approved' ? 'Adopted' : status === 'Rejected' ? 'Available' : 'Reserved' });
  res.json({ adoption: a });
}));

// DELETE: owner cancels a pending request; admin can remove any
router.delete('/:id', protect, wrap(async (req, res) => {
  const a = await Adoption.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Request not found' });
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(a.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  if (!isAdmin && a.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be cancelled' });
  if (a.status !== 'Rejected') await Pet.findByIdAndUpdate(a.pet, { status: 'Available' });
  await a.deleteOne();
  res.json({ message: 'Request removed' });
}));

module.exports = router;
