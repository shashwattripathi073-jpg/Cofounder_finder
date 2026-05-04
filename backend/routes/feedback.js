const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// Submit Feedback
router.post('/', auth, async (req, res) => {
    try {
        const { rating, message } = req.body;
        const feedback = new Feedback({
            userId: req.user.id,
            rating,
            message
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all feedback (admin only maybe, but here just get all)
router.get('/', auth, async (req, res) => {
    try {
        const fetchFeedback = await Feedback.find()
            .populate('userId', 'firstName lastName role')
            .sort({ createdAt: -1 });
        res.json(fetchFeedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
