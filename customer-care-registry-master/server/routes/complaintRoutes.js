const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const ctrl = require('../controllers/complaintController');

router.post('/', auth, allowRoles('customer'), ctrl.createComplaint);
router.get('/mine', auth, allowRoles('customer'), ctrl.getMyComplaints);
router.get('/agent', auth, allowRoles('agent'), ctrl.getAssignedComplaints);
router.get('/', auth, allowRoles('admin'), ctrl.getAllComplaints);
router.get('/:id', auth, ctrl.getComplaintById);
router.patch('/:id/assign', auth, allowRoles('admin'), ctrl.assignComplaint);
router.patch('/:id/status', auth, allowRoles('agent', 'admin'), ctrl.updateStatus);
router.patch('/:id/feedback', auth, allowRoles('customer'), ctrl.leaveFeedback);

module.exports = router;
