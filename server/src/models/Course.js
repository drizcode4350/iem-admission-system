const { Schema, model } = require('mongoose');
module.exports = model('Course', new Schema({
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  seats: { type: Number, default: 60 },
  isOpen: { type: Boolean, default: true },
}));
