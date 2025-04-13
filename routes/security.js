import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import VisitorRequest from '../models/visitorrequest.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/users.js';

const router = express.Router();

router.post('/visitor', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, address, time, purpose } = req.body;
  const roomno = Number(req.body.roomno);

  try {
    let imageUrl = '';

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

    const newRequest = new VisitorRequest({
      visitorName: name,
      address,
      time,
      purpose,
      imageUrl,
      roomno,
    });
    await newRequest.save();

    if (global.io) {
      global.io.emit('new_request', newRequest);
    }

    res.json({ message: 'Visitor details received', request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting visitor details' });
  }
});

router.patch('/request/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedRequest = await VisitorRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Visitor request not found' });
    }

    if (global.io) {
      global.io.emit('status_update', updatedRequest);
    }

    res.json({ message: 'Status updated', request: updatedRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

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

router.get('/owner/:id',verifyToken,async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const id = req.params.id;
    const emailid = id + "@flat.com";
    const user = await User.findOne({ email: emailid }); // FIX: findOne instead of find

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

export { router as securityRouter };
