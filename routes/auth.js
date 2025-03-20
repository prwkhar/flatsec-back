const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Dummy users for demonstration.
const users = {
  owner: { email: 'owner@example.com', password: 'ownerpass', role: 'owner' },
  security: { email: 'security@example.com', password: 'securitypass', role: 'security' },
};

// POST /api/auth/owner/login
const ownerlogin = router.post('/owner/login', (req, res) => {
  const { email, password } = req.body;
  if (email === users.owner.email && password === users.owner.password) {
    const token = jwt.sign({ email, role: 'owner' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid owner credentials' });
});

// POST /api/auth/security/login
const securitylogin = router.post('/security/login', (req, res) => {
  const { email, password } = req.body;
  if (email === users.security.email && password === users.security.password) {
    const token = jwt.sign({ email, role: 'security' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid security credentials' });
});

export {ownerlogin,securitylogin};
