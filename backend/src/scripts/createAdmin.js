// backend/src/scripts/createAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const SALT_ROUNDS = 10;

async function createAdminIfMissing() {
  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Admin env vars not provided — skipping admin creation.');
    return;
  }

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    if (existing.role !== 'admin') {
      console.log(`User with email ${email} exists. Will NOT overwrite password. Setting role -> admin.`);
      existing.role = 'admin';
      await existing.save();
    } else {
      console.log('Admin already exists — OK.');
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = new User({
    username,
    email,
    passwordHash,
    role: 'admin'
  });
  await admin.save();
  console.log(`Admin created: ${email}`);
}

module.exports = { createAdminIfMissing };
