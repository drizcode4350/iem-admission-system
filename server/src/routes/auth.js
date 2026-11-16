const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { PASSWORD_RE } = require('../utils/validate');

const sign = (u) => jwt.sign({ sub: u._id.toString(), role: u.role, name: u.fullName },
  process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

// FR-1 / FR-5: public registration always creates an APPLICANT; role from body is ignored.
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body || {};
  const errors = {};
  if (!fullName || fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Valid email required';
  if (!password || !PASSWORD_RE.test(password)) errors.password = 'Min 8 chars with a letter and a number';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered', errors: { email: 'Email already registered' } });
  const user = await User.create({ fullName, email, passwordHash: await bcrypt.hash(password, 10), role: 'applicant' });
  res.status(201).json({ token: sign(user), user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash)))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(user), user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
});

router.get('/me', requireAuth, async (req, res) => {
  const u = await User.findById(req.user.id).select('-passwordHash');
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
});
module.exports = router;
