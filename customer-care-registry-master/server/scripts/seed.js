/**
 * Seed script — creates demo accounts so you have something to log in with.
 *
 * Usage (from the server/ directory):
 *   node scripts/seed.js
 *
 * Accounts created (password for all: password123):
 *   admin@ccr.test   — admin
 *   agent@ccr.test   — agent
 *   priya@ccr.test   — agent
 *   rahul@ccr.test   — agent
 *   emily@ccr.test   — agent
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function upsertUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`  ↩  Already exists: ${email}`);
    return existing;
  }
  const user = await User.create({ name, email, password, role });
  console.log(`  ✅  Created: ${email} (${role})`);
  return user;
}

async function seed() {
  await connectDB();

  console.log('\n🌱  Seeding accounts...\n');

  await upsertUser({ name: 'Admin',        email: 'admin@ccr.test',  password: 'password123', role: 'admin'  });
  await upsertUser({ name: 'Sam Agent',    email: 'agent@ccr.test',  password: 'password123', role: 'agent'  });
  await upsertUser({ name: 'Priya Sharma', email: 'priya@ccr.test',  password: 'password123', role: 'agent'  });
  await upsertUser({ name: 'Rahul Verma', email: 'rahul@ccr.test',  password: 'password123', role: 'agent'  });
  await upsertUser({ name: 'Emily Clark',  email: 'emily@ccr.test',  password: 'password123', role: 'agent'  });

  console.log('\n✅  Seeding complete.\n');
}

seed()
  .catch((err) => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
