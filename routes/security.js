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
        uploadStream.end(req.file.buffer); // Write file buffer to Cloudinary
      });

      imageUrl = result.secure_url;
    }

    // Now create the visitor request
    const newRequest = new VisitorRequest({
      visitorName: name,
      address,
      time,
      purpose,
      imageUrl,
      roomno,
    });
    await newRequest.save();

    // Emit new visitor request event if using Socket.IO
    if (global.io) {
      global.io.emit('new_request', newRequest);
    }

    res.json({ message: 'Visitor details received', request: newRequest });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting visitor details' });
  }
});

// **GET /api/security/requests - Get all visitor requests (protected)**
router.get('/requests', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const requests = await VisitorRequest.find().sort({ createdAt: -1 }); // Get all visitor requests sorted by latest
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

export { router as securityRouter };
