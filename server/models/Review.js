const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: [true, 'Please write a short comment'], maxlength: 500 }
}, { timestamps: true });
reviewSchema.index({ pet: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);
