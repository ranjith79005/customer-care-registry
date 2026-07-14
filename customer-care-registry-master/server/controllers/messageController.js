const Message = require('../models/Message');
const Complaint = require('../models/Complaint');

async function assertAccess(complaintId, user) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const err = new Error('Complaint not found');
    err.status = 404;
    throw err;
  }

  const isOwner = complaint.customer.toString() === user._id.toString();
  const isAssignedAgent =
    complaint.assignedAgent && complaint.assignedAgent.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAssignedAgent && !isAdmin) {
    const err = new Error('You do not have access to this conversation');
    err.status = 403;
    throw err;
  }

  return complaint;
}

exports.getMessages = async (req, res, next) => {
  try {
    await assertAccess(req.params.complaintId, req.user);

    const messages = await Message.find({ complaint: req.params.complaintId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    await assertAccess(req.params.complaintId, req.user);

    const message = await Message.create({
      complaint: req.params.complaintId,
      sender: req.user._id,
      senderRole: req.user.role,
      text: text.trim(),
    });

    const populated = await message.populate('sender', 'name role');
    res.status(201).json({ message: populated });
  } catch (err) {
    next(err);
  }
};
