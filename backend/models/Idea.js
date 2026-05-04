const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
    founderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, default: 'Technology' },
    status: { type: String, enum: ['idea', 'mvp', 'startup'], default: 'idea' },
    lookingFor: [{ type: String }], // Roles looking for (e.g., Developer, Marketing)
    equityOffered: { type: String, default: "TBD" }
}, { timestamps: true });

module.exports = mongoose.model('Idea', ideaSchema);
