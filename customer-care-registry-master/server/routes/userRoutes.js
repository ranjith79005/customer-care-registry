const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');
const { listAgents, createStaffUser } = require('../controllers/userController');

router.get('/agents', auth, allowRoles('admin'), listAgents);
router.post('/staff', auth, allowRoles('admin'), createStaffUser);

module.exports = router;
