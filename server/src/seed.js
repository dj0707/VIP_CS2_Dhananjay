import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './model/User.js';
import { Announcement } from './model/Announcement.js';
import { Category } from './model/Category.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_complaints');

if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD && process.env.SEED_ADMIN_NAME) {
  const existingAdmin = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME,
      email: process.env.SEED_ADMIN_EMAIL,
      phone: process.env.SEED_ADMIN_PHONE,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: 'ADMIN',
      department: process.env.SEED_ADMIN_DEPARTMENT || 'Administration',
      emailVerified: true
    });
  }
  console.log('Initial administrator ready');
}

const categories = [
  ['Water Leakage', 'Infrastructure'],
  ['Roads', 'Infrastructure'],
  ['Electricity', 'Operations'],
  ['Sanitation', 'Facilities Management'],
  ['Infrastructure', 'Infrastructure'],
  ['IT Support', 'IT Department'],
  ['HR', 'HR Department'],
  ['Security', 'Security'],
  ['Finance', 'Finance'],
  ['Healthcare', 'Healthcare'],
  ['Education', 'Education'],
  ['Police', 'Government Services'],
  ['Transport', 'Operations'],
  ['Facilities', 'Facilities Management'],
  ['General', 'Customer Support']
];
for (const [name, department] of categories) {
  await Category.findOneAndUpdate({ name }, { name, department, active: true }, { upsert: true, new: true });
}

await Announcement.findOneAndUpdate(
  { title: 'Portal is open for complaints' },
  {
    title: 'Portal is open for complaints',
    message: 'Users can register, submit complaints with image evidence, and track status updates.',
    active: true
  },
  { upsert: true, new: true }
);

console.log('Seed categories and announcements ready');
await mongoose.disconnect();
