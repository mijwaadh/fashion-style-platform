// // Run with: node promote-admin.js
// // Usage: node promote-admin.js your@email.com

// import mongoose from 'mongoose';

// const MONGO_URI = 'mongodb+srv://mijwad:urPOWKHRYRi0hzTP@cluster0.czxgtpv.mongodb.net/fashion-platform?appName=Cluster0';
// const email = process.argv[2];

// if (!email) {
//     console.error('Usage: node promote-admin.mjs your@email.com');
//     process.exit(1);
// }

// await mongoose.connect(MONGO_URI);
// const result = await mongoose.connection.db.collection('users').updateOne(
//     { email },
//     { $set: { role: 'admin' } }
// );

// if (result.matchedCount === 0) {
//     console.log('❌ No user found with email:', email);
// } else {
//     console.log('✅ Role updated to admin for:', email);
// }

// await mongoose.disconnect();
