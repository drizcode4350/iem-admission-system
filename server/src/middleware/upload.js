// Module 1 — Document Upload with multer. PDF only, size + count limits, random names.
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, _file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + '.pdf'),
});
const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_MB) || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const okExt = path.extname(file.originalname).toLowerCase() === '.pdf';
    const okMime = file.mimetype === 'application/pdf';
    if (okExt && okMime) cb(null, true);
    else cb(Object.assign(new Error('Only PDF files are allowed'), { status: 400 }));
  },
});
module.exports = { upload, UPLOAD_DIR };
