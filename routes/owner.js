import express from 'express'
import verifyToken from '../middleware/auth.js';
import visitorrequest from '../models/visitorrequest.js';
const router = express.Router();
// GET /api/owner/requests - get visitor requests (protected)
const getvisitorreq = router.get('/requests', verifyToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const requests = await VisitorRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// POST /api/owner/requests/:id/respond - respond to a visitor request
const responsevisitor = router.post('/requests/:id/respond', verifyToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const requestId = req.params.id;
  const { accepted } = req.body;
  try {
    // For simplicity, we'll just remove the request.
    await VisitorRequest.findByIdAndRemove(requestId);
    // You might also update the database or send further notifications here.
    res.json({ message: accepted ? 'Request approved' : 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

export {getvisitorreq,responsevisitor};
