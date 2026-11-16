const { Schema, model } = require('mongoose');
const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'admin', 'director'], default: 'applicant' },
  fullName: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});
module.exports = model('User', userSchema);
