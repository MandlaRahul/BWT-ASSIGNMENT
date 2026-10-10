const router = require('express').Router();
const Review = require('../models/Review');
const Pet = require('../models/Pet');
const { wrap, protect } = require('../middleware/auth');

async function recalc(petId) {
  const [s] = await Review.aggregate([{ $match: { pet: petId } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  await Pet.findByIdAndUpdate(petId, { ratingAvg: s ? Math.round(s.avg * 10) / 10 : 0, ratingCount: s ? s.n : 0 });
}

router.get('/pet/:petId', wrap(async (req, res) =>
  res.json({ reviews: await Review.find({ pet: req.params.petId }).populate('user', 'name').sort('-createdAt') })));

// CREATE or UPDATE the signed-in user's review for a pet
router.post('/pet/:petId', protect, wrap(async (req, res) => {
  const { rating, comment } = req.body;
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'Choose a rating from 1 to 5' });
  if (!comment || comment.trim().length < 3) return res.status(400).json({ message: 'Please write a short comment' });
  const pet = await Pet.findById(req.params.petId);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  const review = await Review.findOneAndUpdate({ pet: pet._id, user: req.user._id }, { rating, comment }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  await recalc(pet._id);
  res.status(201).json({ review });
}));

router.delete('/:id', protect, wrap(async (req, res) => {
  const r = await Review.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Review not found' });
  if (req.user.role !== 'admin' && String(r.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
  await r.deleteOne(); await recalc(r.pet);
  res.json({ message: 'Review deleted' });
}));

module.exports = router;
