const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');

// Create Idea
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, industry, lookingFor, equityOffered } = req.body;
        const idea = new Idea({
            founderId: req.user.id,
            title,
            description,
            industry,
            lookingFor,
            equityOffered
        });
        await idea.save();
        res.status(201).json(idea);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all ideas (Feed)
router.get('/', async (req, res) => {
    try {
        const ideas = await Idea.find().populate('founderId', 'firstName lastName profileImage role');
        res.json(ideas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's own ideas
router.get('/my', auth, async (req, res) => {
    try {
        const ideas = await Idea.find({ founderId: req.user.id });
        res.json(ideas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
