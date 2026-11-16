// APPLICATION LAYER: Express app running inside the Node.js process.
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' });
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});
module.exports = app;
