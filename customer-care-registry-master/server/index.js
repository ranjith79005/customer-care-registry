require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_ORIGIN,           // set in Render env vars
  'https://customer-registry-lilac.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (covers all preview deployments)
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// --- routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- centralized error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server',
  });
});

const PORT = process.env.PORT || 5000;

const User = require('./models/User');

async function seedDemoAccounts() {
  const demos = [
    { name: 'Admin',        email: 'admin@ccr.test', password: 'password123', role: 'admin' },
    { name: 'Sam Agent',    email: 'agent@ccr.test', password: 'password123', role: 'agent' },
    { name: 'Priya Sharma', email: 'priya@ccr.test', password: 'password123', role: 'agent' },
  ];
  for (const d of demos) {
    const exists = await User.findOne({ email: d.email });
    if (!exists) await User.create(d);
  }
  console.log('🌱  Demo accounts ready (admin@ccr.test / agent@ccr.test — password123)');
}

connectDB().then(async () => {
  await seedDemoAccounts();
  app.listen(PORT, () => {
    console.log(`Customer Care Registry API listening on http://localhost:${PORT}`);
  });
});
