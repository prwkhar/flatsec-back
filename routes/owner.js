import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/users.js';
import VisitorRequest from '../models/visitorrequest.js';

const router = express.Router();


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


// POST /api/owner/requests/:id/respond - respond to a visitor request
router.post('/requests/:id/respond', verifyToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const requestId = req.params.id;
  const { accepted } = req.body;
  try {
    // For simplicity, we'll remove the request.
    if(requestId){
    await VisitorRequest.findOneAndDelete(requestId);}
    res.json({ message: accepted ? 'Request approved' : 'Request rejected' });
  } catch (err) {
    res.status(500).json({ message: `Error processing request error ${err}` });
  }
});


export { router as ownerRouter };
