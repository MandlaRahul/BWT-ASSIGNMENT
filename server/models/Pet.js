const mongoose = require('mongoose');
const petSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Pet name is required'], trim: true },
  category: { type: String, enum: ['Dog', 'Cat', 'Rabbit', 'Reptile', 'Other'], required: true },
  breed: { type: String, required: [true, 'Breed is required'], trim: true },
  age: { type: String, required: [true, 'Age is required'] },
  ageGroup: { type: String, enum: ['Baby', 'Young', 'Adult', 'Senior'], default: 'Adult' },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  color: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, required: [true, 'Description is required'] },
  personality: [String],
  // health = verified records from the shelter vet; care = general advice only
  health: {
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    knownIssues: { type: String, default: 'None known' },
    vetNotes: { type: String, default: '' }
  },
  care: { diet: String, grooming: String, exercise: String, special: String, general: String },
  safetyNote: { type: String, default: '' },
  requirements: { type: String, default: '' },
  shelter: { name: { type: String, default: 'PawHaven Partner Shelter' }, city: { type: String, default: '' } },
  adoptionFee: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Reserved', 'Adopted'], default: 'Available' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Pet', petSchema);
