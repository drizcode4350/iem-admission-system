const router = require('express').Router();
const { Types } = require('mongoose');
const Application = require('../models/Application');
const { requireAuth, requireRole } = require('../middleware/auth');
const { canTransition, allowedNext } = require('../utils/status');

router.use(requireAuth, requireRole('admin')); // FR-22: only admins

// FR-26 / FR-27: paginated, searchable queue. Drafts are never visible to admins.
router.get('/applications', async (req, res) => {
  const { q, status, courseId } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const filter = { status: { $ne: 'Draft' } };
  if (status && status !== 'Draft') filter.status = status;
  if (courseId && Types.ObjectId.isValid(courseId)) filter.courseId = courseId;
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ fullName: rx }, { applicationNo: rx }];
  }
  const [items, total] = await Promise.all([
    Application.find(filter).populate('courseId', 'courseName department')
      .select('applicationNo fullName courseId status submissionDate')
      .sort({ submissionDate: -1 }).skip((page - 1) * limit).limit(limit),
    Application.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

router.get('/applications/:id', async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Not found' });
  const app = await Application.findOne({ _id: req.params.id, status: { $ne: 'Draft' } })
    .populate('courseId').populate('statusHistory.changedBy', 'fullName role');
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json({ ...app.toObject(), allowedNext: allowedNext(app.status) });
});

// FR-21 / FR-23: validated transition + history log.
router.patch('/applications/:id/status', async (req, res) => {
  const { status, remarks } = req.body || {};
  const app = await Application.findOne({ _id: req.params.id, status: { $ne: 'Draft' } });
  if (!app) return res.status(404).json({ message: 'Not found' });
  if (!canTransition(app.status, status))
    return res.status(400).json({ message: `Transition ${app.status} → ${status} is not allowed`, allowed: allowedNext(app.status) });
  app.statusHistory.push({ from: app.status, to: status, changedBy: req.user.id, remarks });
  app.status = status;
  if (remarks) app.remarks = remarks;
  await app.save();
  res.json({ ...app.toObject(), allowedNext: allowedNext(app.status) });
});
module.exports = router;
