import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import VisitorRequest from '../models/VisitorRequest.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// POST /api/security/visitor - submit visitor details with image upload (protected)
// Use multer middleware 'upload.single' to handle file upload from field "image"
router.post('/visitor', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'security') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { name, address, time, purpose } = req.body;
  
  try {
    let imageUrl = '';

    // If an image file is provided, upload it to Cloudinary
    if (req.file) {
      // Upload file buffer from multer
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'visitor_images' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return res.status(500).json({ message: 'Image upload failed' });
          }
          imageUrl = result.secure_url;

          // Once the image is uploaded, create the visitor request
          createVisitorRequest();
        }
      );

      // Write the file buffer to the stream
      result.end(req.file.buffer);
    } else {
      // No image provided, just create the visitor request
      createVisitorRequest();
    }

    // Helper function to create and save the request once imageUrl is set.
    async function createVisitorRequest() {
      const newRequest = new VisitorRequest({
        visitorName: name,
        address,
        time,
        purpose,
        imageUrl,
      });
      await newRequest.save();

      // Emit new visitor request event (assuming Socket.IO is set up in index.js)
      // We use "global.io" below; in your index.js, you can assign io to global.io.
      if (global.io) {
        global.io.emit('new_request', newRequest);
      }

      res.json({ message: 'Visitor details received', request: newRequest });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting visitor details' });
  }
});

export { router as securityRouter };
