const mongoose = require('mongoose');
const adoptionSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: [true, 'Phone is required'] },
  address: { type: String, required: [true, 'Address is required'] },
  housing: { type: String, enum: ['House with yard', 'House without yard', 'Apartment', 'Farm / rural'], required: true },
  experience: { type: String, enum: ['First-time owner', 'Some experience', 'Experienced'], required: true },
  otherPets: { type: String, default: '' },
  reason: { type: String, required: [true, 'Please tell us why you want to adopt'], minlength: [20, 'Reason must be at least 20 characters'] },
  visitDate: { type: Date, required: [true, 'Choose a meet-and-greet date'] },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNote: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Adoption', adoptionSchema);
