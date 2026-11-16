// FR-16: files are only served through this authenticated route (owner or admin).
const router = require('express').Router();
const path = require('path');
const Application = require('../models/Application');
const { requireAuth } = require('../middleware/auth');
const { UPLOAD_DIR } = require('../middleware/upload');
router.get('/:docId', requireAuth, async (req, res) => {
  const app = await Application.findOne({ 'documents._id': req.params.docId });
  if (!app) return res.status(404).json({ message: 'Not found' });
  const isOwner = app.applicantId.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') return res.status(404).json({ message: 'Not found' });
  const doc = app.documents.id(req.params.docId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
  res.sendFile(path.join(UPLOAD_DIR, doc.storedKey));
});
module.exports = router;
