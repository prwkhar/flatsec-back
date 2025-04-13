// owner.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/users.js';
import VisitorRequest from '../models/visitorrequest.js';

const router = express.Router();

// GET /api/owner/requests - fetch requests for the owner's room (protected)
router.get('/requests', verifyToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    console.log(req.user);
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const requests = await VisitorRequest.find({ roomno: user.roomno }).sort({ createdAt: -1 });
    console.log(requests);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// POST /api/owner/requests/:id/respond - respond to a visitor request (protected)
// Instead of deleting the request, we update its status.
router.post('/requests/:id/respond', verifyToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const requestId = req.params.id;
  const { accepted } = req.body; // accepted should be a boolean

  try {
    const updatedRequest = await VisitorRequest.findByIdAndUpdate(
      requestId,
      { status: accepted ? 1 : -1 }, // 1 = approved, -1 = rejected
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Visitor request not found' });
    }
    
    // Optionally, emit a socket event here so that Security clients are updated.
    if (global.io) {
      global.io.emit('status_update', updatedRequest);
    }
    
    res.json({ message: accepted ? 'Request approved' : 'Request rejected', request: updatedRequest });
  } catch (err) {
    res.status(500).json({ message: `Error processing request: ${err}` });
  }
});

router.patch('/toggle-call-permission', verifyToken, async (req, res) => {
  try {
    const { permission } = req.body;
    console.log('Permission:', permission);
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { permission },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ permission: updatedUser.permission });
  } catch (err) {
    console.error('Error updating call permission:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/call-permission', verifyToken, async (req, res) => {
  console.log('Fetching call permission for:', req.user.email);
  try {
    const user = await User.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's current permission value
    res.status(200).json({ permission: user.permission });
  } catch (err) {
    console.error('Error fetching call permission:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export { router as ownerRouter };
