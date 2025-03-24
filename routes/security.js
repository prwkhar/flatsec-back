// security.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import VisitorRequest from '../models/visitorrequest.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// POST /api/security/visitor - submit visitor details with image upload (protected)
router.post('/visitor', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, address, time, purpose } = req.body;
  const roomno = Number(req.body.roomno); // Convert roomno to a number

  try {
    let imageUrl = '';

    // If an image is provided, upload it to Cloudinary
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'visitor_images' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    // Create the visitor request using the provided model
    const newRequest = new VisitorRequest({
      visitorName: name,
      address,
      time,
      purpose,
      imageUrl,
      roomno,
    });
    await newRequest.save();

    // Emit new visitor request event via Socket.IO
    if (global.io) {
      global.io.emit('new_request', newRequest);
    }

    res.json({ message: 'Visitor details received', request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting visitor details' });
  }
});

// PATCH /api/security/request/:id/status - update the status of a visitor request (protected)
router.patch('/request/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { id } = req.params;
  const { status } = req.body; // New status sent from the client (e.g., 0, 1, 2)

  try {
    const updatedRequest = await VisitorRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Visitor request not found' });
    }

    // Emit the updated request to all connected clients
    if (global.io) {
      global.io.emit('status_update', updatedRequest);
    }

    res.json({ message: 'Status updated', request: updatedRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// GET /api/security/requests - Get all visitor requests (protected)
router.get('/requests', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const requests = await VisitorRequest.find().sort({ createdAt: -1 });
    console.log("request-", requests);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

export { router as securityRouter };
