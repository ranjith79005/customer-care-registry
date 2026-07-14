const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Customer creates a complaint
exports.createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      category,
      subcategory,
      channel,
      contactPreference,
      productOrderRef,
      urgencyNote,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const complaint = await Complaint.create({
      title,
      description,
      priority: priority || 'medium',
      category: category || 'general',
      subcategory: subcategory || '',
      channel: channel || 'web',
      contactPreference: contactPreference || 'email',
      productOrderRef: productOrderRef || '',
      urgencyNote: urgencyNote || '',
      customer: req.user._id,
    });

    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
};

// Customer: only their own complaints
exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ customer: req.user._id })
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// Agent: complaints assigned to them
exports.getAssignedComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ assignedAgent: req.user._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// Admin: every complaint
exports.getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

// Anyone involved (owner / assigned agent / admin) can view one complaint
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.customer._id.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent && complaint.assignedAgent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({ message: 'You do not have access to this complaint' });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

// Admin assigns a complaint to an agent
exports.assignComplaint = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(400).json({ message: 'agentId must belong to a valid agent' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedAgent: agentId, status: 'assigned' },
      { new: true }
    ).populate('assignedAgent', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

// Agent/Admin updates status (e.g. in-progress, resolved, closed)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['open', 'assigned', 'in-progress', 'resolved', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isAssignedAgent =
      complaint.assignedAgent && complaint.assignedAgent.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssignedAgent) {
      return res.status(403).json({ message: 'Only the assigned agent or an admin can update status' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

// Customer leaves feedback once a complaint is resolved/closed
exports.leaveFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be a number from 1 to 5' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the complaint owner can leave feedback' });
    }

    complaint.feedback = { rating, comment };
    await complaint.save();

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};
