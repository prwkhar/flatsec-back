import express from 'express'
import verifyToken from '../middleware/auth.js';
import visitorrequest from '../models/visitorrequest.js';
const router = express.Router();

const { io } = require('../index'); // Import the Socket.IO instance

// POST /api/security/visitor - submit visitor details (protected)
const postvisitordetails = router.post('/visitor', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { name, address, time, purpose } = req.body;
  try {
    const newRequest = new VisitorRequest({
      visitorName: name,
      address,
      time,
      purpose,
    });
    await newRequest.save();

    // Emit the new visitor request to all connected clients
    io.emit('new_request', newRequest);

    res.json({ message: 'Visitor details received', request: newRequest });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting visitor details' });
  }
});

export {postvisitordetails};
