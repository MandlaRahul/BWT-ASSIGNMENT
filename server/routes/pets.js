const router = require('express').Router();
const Pet = require('../models/Pet');
const Adoption = require('../models/Adoption');
const Review = require('../models/Review');
const { wrap, protect, adminOnly } = require('../middleware/auth');

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sorts = { newest: { createdAt: -1 }, rating: { ratingAvg: -1, ratingCount: -1 }, name: { name: 1 }, fee: { adoptionFee: 1 } };

// READ: list with search / filter / sort
router.get('/', wrap(async (req, res) => {
  const { q, category, gender, size, status, ageGroup, sort, limit } = req.query;
  const f = {};
  if (category) f.category = category;
  if (gender) f.gender = gender;
  if (size) f.size = size;
  if (status) f.status = status;
  if (ageGroup) f.ageGroup = ageGroup;
  if (q) { const r = new RegExp(esc(q), 'i'); f.$or = [{ name: r }, { breed: r }, { color: r }, { description: r }]; }
  let query = Pet.find(f).sort(sorts[sort] || sorts.newest);
  if (limit) query = query.limit(Math.min(+limit || 20, 100));
  const pets = await query;
  res.json({ pets, total: pets.length });
}));

router.get('/stats', wrap(async (req, res) => {
  const [total, available, adopted, byCat] = await Promise.all([
    Pet.countDocuments(), Pet.countDocuments({ status: 'Available' }), Pet.countDocuments({ status: 'Adopted' }),
    Pet.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
  ]);
  res.json({ total, available, adopted, byCategory: Object.fromEntries(byCat.map(c => [c._id, c.count])) });
}));

router.get('/:id', wrap(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  res.json({ pet });
}));

// CREATE / UPDATE / DELETE (admin only)
router.post('/', protect, adminOnly, wrap(async (req, res) => res.status(201).json({ pet: await Pet.create(req.body) })));

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
  const { ratingAvg, ratingCount, _id, ...data } = req.body;
  const pet = await Pet.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  res.json({ pet });
}));

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  const pet = await Pet.findByIdAndDelete(req.params.id);
  if (!pet) return res.status(404).json({ message: 'Pet not found' });
  await Promise.all([Adoption.deleteMany({ pet: pet._id }), Review.deleteMany({ pet: pet._id })]);
  res.json({ message: 'Pet deleted' });
}));

module.exports = router;
