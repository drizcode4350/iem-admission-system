// Applicant-only routes. Every query is scoped by applicantId = req.user.id (FR-4).
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const Course = require('../models/Course');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload, UPLOAD_DIR } = require('../middleware/upload');
const { validateApplication } = require('../utils/validate');

const FIELDS = ['fullName', 'dob', 'phone', 'address', 'courseId', 'percent10', 'percent12', 'iemjeeRank'];
const pick = (b) => Object.fromEntries(FIELDS.filter((f) => b[f] !== undefined).map((f) => [f, b[f] === '' ? null : b[f]]));

router.use(requireAuth, requireRole('applicant'));

async function ownDraft(req, res) {
  const app = await Application.findOne({ _id: req.params.id, applicantId: req.user.id });
  if (!app) { res.status(404).json({ message: 'Application not found' }); return null; }
  if (app.locked) { res.status(409).json({ message: 'Application is locked after submission' }); return null; }
  return app;
}

router.get('/mine', async (req, res) => {
  const app = await Application.findOne({ applicantId: req.user.id }).populate('courseId');
  res.json(app); // null if none yet
});

// Create (one application per applicant) or save draft
router.post('/', async (req, res) => {
  const data = pick(req.body || {});
  const errors = validateApplication(data);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  if (data.courseId && !(await Course.exists({ _id: data.courseId, isOpen: true }))) return res.status(400).json({ message: 'Invalid course', errors: { courseId: 'Invalid course' } });
  const existing = await Application.findOne({ applicantId: req.user.id });
  if (existing) return res.status(409).json({ message: 'You already have an application', id: existing._id });
  const app = await Application.create({ ...data, applicantId: req.user.id, status: 'Draft' });
  res.status(201).json(app);
});

router.put('/:id', async (req, res) => {
  const app = await ownDraft(req, res); if (!app) return;
  const data = pick(req.body || {});
  const errors = validateApplication(data);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  if (data.courseId && !(await Course.exists({ _id: data.courseId, isOpen: true }))) return res.status(400).json({ message: 'Invalid course', errors: { courseId: 'Invalid course' } });
  Object.assign(app, data); await app.save();
  res.json(app);
});

router.post('/:id/documents', async (req, res, next) => {
  const app = await ownDraft(req, res); if (!app) return;
  const max = Number(process.env.MAX_FILES) || 5;
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (app.documents.length >= max) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: `Maximum ${max} files allowed` });
    }
    app.documents.push({
      docType: req.body.docType || 'certificate', originalName: req.file.originalname,
      storedKey: req.file.filename, size: req.file.size, mimeType: req.file.mimetype,
    });
    await app.save();
    res.status(201).json(app);
  });
});

router.delete('/:id/documents/:docId', async (req, res) => {
  const app = await ownDraft(req, res); if (!app) return;
  const doc = app.documents.id(req.params.docId);
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  fs.unlink(path.join(UPLOAD_DIR, doc.storedKey), () => {});
  doc.deleteOne(); await app.save();
  res.json(app);
});

// FR-18 / FR-19: validate full record, generate number, lock.
router.post('/:id/submit', async (req, res) => {
  const app = await ownDraft(req, res); if (!app) return;
  const errors = validateApplication(app.toObject(), { full: true });
  if (!app.documents.length) errors.documents = 'At least one PDF certificate is required';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Application incomplete', errors });
  const year = new Date().getFullYear();
  const count = await Application.countDocuments({ applicationNo: { $regex: `^IEM-${year}-` } });
  app.applicationNo = `IEM-${year}-${String(count + 1).padStart(4, '0')}`;
  app.statusHistory.push({ from: 'Draft', to: 'Submitted', changedBy: req.user.id });
  app.status = 'Submitted'; app.locked = true; app.submissionDate = new Date();
  await app.save();
  res.json(app);
});
module.exports = router;
