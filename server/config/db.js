const mongoose = require('mongoose');

let _memServer = null;

/**
 * Connect to MongoDB.
 *
 * Priority:
 *  1. MONGO_URI env var pointing to Atlas / local mongod  → use it directly
 *  2. No URI, or URI is localhost and connection fails     → spin up an
 *     in-process MongoMemoryServer (no installation needed)
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || '';
  const isLocalhost = !uri || uri.includes('127.0.0.1') || uri.includes('localhost');

  if (!isLocalhost) {
    // ── Atlas / remote MongoDB ─────────────────────────────────────────
    try {
      await mongoose.connect(uri);
      console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error('❌  MongoDB connection error:', err.message);
      process.exit(1);
    }
  }

  // ── In-memory MongoDB (fallback for local dev without mongod) ─────────
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    _memServer = await MongoMemoryServer.create();
    const memUri = _memServer.getUri();
    await mongoose.connect(memUri);
    console.log('🧠  Using in-memory MongoDB (data resets on server restart)');
    console.log(`    URI: ${memUri}`);
  } catch (err) {
    // mongodb-memory-server not installed — try original URI anyway
    if (uri) {
      try {
        await mongoose.connect(uri);
        console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
        return;
      } catch (e) {
        console.error('❌  MongoDB connection error:', e.message);
      }
    }
    console.error('❌  No MongoDB available. Install mongodb-memory-server or set MONGO_URI to Atlas.');
    process.exit(1);
  }
}

// Gracefully close the in-memory server when the process exits
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  if (_memServer) await _memServer.stop();
  process.exit(0);
});

mongoose.connection.on('disconnected', () => console.warn('⚠️   MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅  MongoDB reconnected'));

module.exports = connectDB;
