// Module 2 — Auth & RBAC. Every protected route verifies the JWT AND the role (FR-3).
const jwt = require('jsonwebtoken');
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: p.sub, role: p.role, fullName: p.name };
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Forbidden for role ' + req.user?.role });
module.exports = { requireAuth, requireRole };
