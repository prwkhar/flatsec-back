import dotenv from "dotenv";
import User from "./models/users.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
dotenv.config();

// Utility function to generate random names and phones
function getRandomName() {
  const names = ["Aryan", "Diya", "Rohan", "Meera", "Kunal", "Ananya", "Tara", "Vivaan", "Aisha", "Neel"];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000); // 10-digit starting with 9
}

function getRandomPermission() {
  return Math.random() > 0.5;
}

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});

    const ownerPasswordHash = await bcrypt.hash("ownerpass", 10);
    const securityPasswordHash = await bcrypt.hash("securitypass", 10);
    const adminPasswordHash = await bcrypt.hash("adminpass", 10);

    const owners = Array.from({ length: 10 }, (_, i) => ({
      email: `room${i + 1}@flat.com`,
      password: ownerPasswordHash,
      role: "owner",
      roomno: i + 1,
      name: getRandomName(),
      phoneno: getRandomPhone(),
      permission: getRandomPermission(),
    }));

    const users = [
      {
        email: "admin@gmail.com",
        password: adminPasswordHash,
        role: "admin",
        name: "Admin",
        phoneno: getRandomPhone(),
        permission: true,
      },
      ...owners,
      {
        email: "security@example.com",
        password: securityPasswordHash,
        role: "security",
        name: "Guard Bhaiya",
        phoneno: getRandomPhone(),
        permission: true,
      },
    ];

    await User.insertMany(users);

    console.log("Dummy users inserted");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

seedUsers();

