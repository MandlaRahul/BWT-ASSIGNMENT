const mongoose = require('mongoose');
module.exports = mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true }, email: { type: String, required: true },
  subject: { type: String, default: '' }, message: { type: String, required: true }
}, { timestamps: true }));
