require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('❌ MongoDB Connection Error: MONGODB_URI is not defined');
    process.exit(1);
}

mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
}).then(async () => {
    try {
        await User.updateMany(
            { role: { $in: ['Founder', 'Company Owner'] } },
            { $set: { accountType: 'company' } }
        );
        const users = await User.find({ accountType: 'company' });
        console.log('Admins:', users.map(u => ({ email: u.email, accountType: u.accountType, role: u.role })));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
});
