const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');

// Send Request
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, ideaId, message } = req.body;
        const senderId = req.user.id;

        if (senderId === receiverId) return res.status(400).json({ error: 'Cannot send request to yourself' });

        const query = { senderId, receiverId };
        if (ideaId) query.ideaId = ideaId;

        const existingRequest = await Request.findOne(query);
        if (existingRequest) return res.status(400).json({ error: 'Request already sent' });

        const request = new Request({ senderId, receiverId, ideaId, message });
        await request.save();

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get ALL received requests (all statuses — pending, accepted, rejected)
router.get('/received', auth, async (req, res) => {
    try {
        const requests = await Request.find({ receiverId: req.user.id })
            .populate('senderId', 'firstName lastName profileImage role accountType bio skills location idCard')
            .populate('ideaId', 'title industry keywords')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Respond to Request
router.post('/respond', auth, async (req, res) => {
    try {
        const { requestId, status } = req.body; // status: 'accepted' or 'rejected'

        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        if (request.receiverId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

        request.status = status;
        await request.save();

        if (status === 'accepted') {
            // Add connection to both users
            await User.findByIdAndUpdate(request.senderId, { $addToSet: { connections: request.receiverId } });
            await User.findByIdAndUpdate(request.receiverId, { $addToSet: { connections: request.senderId } });
        }

        res.status(200).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sent requests (all statuses — for dashboard button state tracking)
router.get('/sent', auth, async (req, res) => {
    try {
        const requests = await Request.find({ senderId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
