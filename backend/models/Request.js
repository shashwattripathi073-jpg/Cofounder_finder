const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String, default: "" } // Optional invitation message
}, { timestamps: true });

module.exports = mongoose.model('ConnectionRequest', requestSchema);
