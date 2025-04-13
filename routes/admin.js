// owner.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/users.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/admin/requests - fetch requests for the owner's room (protected)
router.get('/requests', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    console.log(req.user);
    const user = await User.find({role: 'security'});
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    
    res.json({message: 'User found', data: user});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

//adding security
router.post('/addsecurity', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
 try {
    console.log(req);
    const password = await bcrypt.hash(req.body.password, 10);
    const addsecurity = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: password,
      role: 'security',
    });
    res.json({ message: 'Security added successfully', security: addsecurity });
 } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error adding security: ${err}` });  
 } 
});

router.delete('/removesecurity/:id', verifyToken, async (req, res) => { 
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully', user: deletedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Error deleting user: ${err}` });
    }
    });

export { router as adminRouter };