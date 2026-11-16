const { Schema, model, Types } = require('mongoose');
const { STATUSES } = require('../utils/status');

// FR-14: only a REFERENCE to the file is stored; bytes live on disk (uploads/).
const documentSchema = new Schema({
  docType: { type: String, default: 'certificate' },
  originalName: String,
  storedKey: String, // randomised file name on disk (FR-15)
  size: Number,
  mimeType: String,
  uploadDate: { type: Date, default: Date.now },
});

const historySchema = new Schema({
  from: String, to: String,
  changedBy: { type: Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  remarks: String,
}, { _id: false });

const applicationSchema = new Schema({
  applicationNo: { type: String, unique: true, sparse: true },
  applicantId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: String,
  dob: Date,
  phone: String,
  address: String,
  courseId: { type: Types.ObjectId, ref: 'Course', index: true },
  percent10: Number,
  percent12: Number,
  iemjeeRank: Number,
  status: { type: String, enum: STATUSES, default: 'Draft', index: true },
  submissionDate: Date,
  locked: { type: Boolean, default: false },
  remarks: String,
  documents: [documentSchema],
  statusHistory: [historySchema],
}, { timestamps: true });

module.exports = model('Application', applicationSchema);
