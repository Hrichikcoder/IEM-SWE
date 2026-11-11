/**
 * Helper utility to create a user or reset a forgotten password directly in MongoDB.
 * Usage:
 *   node scripts/manageUser.js <email> <newPassword> [name]
 * Example:
 *   node scripts/manageUser.js student@example.com newpass123 "Hrichik"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin User';

if (!email || !password) {
  console.error('Usage: node scripts/manageUser.js <email> <password> [name]');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stock_analysis_db';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const normalizedEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.password = hashedPassword;
      if (process.argv[4]) {
        user.name = name.trim();
      }
      await user.save();
      console.log(`✅ SUCCESS: Password for user "${normalizedEmail}" has been reset successfully!`);
    } else {
      user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });
      await user.save();
      console.log(`✅ SUCCESS: New user "${normalizedEmail}" created successfully with ID: ${user._id}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error managing user:', err.message);
    process.exit(1);
  }
}

run();
