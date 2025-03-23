import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/users.js";

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Optional: clear existing users
    // Optional: clear existing users
    await User.deleteMany({});

    // Hash passwords for demonstration
    const ownerPasswordHash = await bcrypt.hash("ownerpass", 10);
    const securityPasswordHash = await bcrypt.hash("securitypass", 10);

    // Insert dummy users with hashed passwords
    await User.insertMany([
      {
        email: "room1@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 1,
      },
      {
        email: "room2@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 2,
      },
      {
        email: "room3@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 3,
      },
      {
        email: "room4@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 4,
      },
      {
        email: "room5@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 5,
      },
      {
        email: "room6@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 6,
      },
      {
        email: "room7@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 7,
      },
      {
        email: "room8@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 8,
      },
      {
        email: "room9@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 9,
      },
      {
        email: "room10@flat.com",
        password: ownerPasswordHash,
        role: "owner",
        roomno: 10,
      },
      {
        email: "security@example.com",
        password: securityPasswordHash,
        role: "security",
      },
    ]);

    console.log("Dummy users inserted");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

seedUsers();
