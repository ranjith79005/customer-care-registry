const User = require('../models/User');

// Admin-only: list agents (used to populate the "assign to" dropdown)
exports.listAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('name email');
    res.json({ agents });
  } catch (err) {
    next(err);
  }
};

// Admin-only: create an agent or admin account directly
exports.createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !['agent', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'name, email, password, and role (agent|admin) are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
