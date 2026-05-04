const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Send Message (HTTP fallback or for persistence)
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        const message = new Message({ senderId, receiverId, content });
        await message.save();

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ IMPORTANT: /inbox must come BEFORE /:userId to avoid route conflict
// Get all recent chats (for inbox)
router.get('/inbox', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const messages = await Message.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        }).sort({ createdAt: -1 });

        const chatMap = new Map();
        for (const msg of messages) {
            const otherId = msg.senderId.toString() === currentUserId
                ? msg.receiverId.toString()
                : msg.senderId.toString();
            if (!chatMap.has(otherId)) {
                chatMap.set(otherId, msg);
            }
        }

        const chats = await Promise.all(
            Array.from(chatMap.entries()).map(async ([otherId, lastMessage]) => {
                const otherUser = await User.findById(otherId).select('firstName lastName profileImage role');
                return { otherUser, lastMessage };
            })
        );

        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chat history with another user — must come AFTER /inbox
router.get('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
