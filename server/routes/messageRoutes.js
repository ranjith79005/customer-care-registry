const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controllers/messageController');

router.get('/:complaintId', auth, getMessages);
router.post('/:complaintId', auth, sendMessage);

module.exports = router;
