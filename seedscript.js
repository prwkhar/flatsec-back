import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/users.js';

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Optional: clear existing users
    await User.deleteMany({});

    // Hash passwords for demonstration
    const ownerPasswordHash = await bcrypt.hash('ownerpass', 10);
    const securityPasswordHash = await bcrypt.hash('securitypass', 10);

    // Insert dummy users
    await User.insertMany([
      { email: 'owner@example.com', password: ownerPasswordHash, role: 'owner' },
      { email: 'security@example.com', password: securityPasswordHash, role: 'security' },
    ]);

    console.log('Dummy users inserted');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers();
