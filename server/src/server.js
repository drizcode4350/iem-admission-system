require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET missing in .env'); process.exit(1); }
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API on http://localhost:${PORT}/api`)))
  .catch((e) => { console.error(e); process.exit(1); });
