import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/users.js'; // Adjust the path as needed

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// POST /api/auth/owner/login
router.post('/owner/login', async (req, res) => {
  console.log("got the request");
  const { email, password } = req.body;
  try {
    // Find the owner user from the database
    console.log("got the request");
    const user = await User.findOne({ email, role: 'owner' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid owner credentials' });
    }
    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid owner credentials' });
    }
    // Generate a JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/security/login
router.post('/security/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the security user from the database
    const user = await User.findOne({ email, role: 'security' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid security credentials' });
    }
    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid security credentials' });
    }
    // Generate a JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/owner/logout
router.post('/owner/logout', (req, res) => {
  // In a stateless JWT setup, the server doesn't track sessions.
  // The client should simply delete the token.
  return res.json({ message: 'Owner logged out successfully' });
});

// POST /api/auth/security/logout
router.post('/security/logout', (req, res) => {
  // Similarly, inform the client to remove the token.
  return res.json({ message: 'Security user logged out successfully' });
});

export { router as authRouter };
