import mongoose from 'mongoose';

const VisitorRequestSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  address: { type: String },
  time: { type: String },
  purpose: { type: String, required: true },
  imageUrl: { type: String }, // URL of the uploaded image on Cloudinary
  roomno: {type: Number, required: true},
  createdAt: { type: Date, default: Date.now },
});

const VisitorRequest = mongoose.model('VisitorRequest', VisitorRequestSchema);
export default VisitorRequest;


