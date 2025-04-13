import mongoose from 'mongoose';

const VisitorRequestSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  address: { type: String },
  time: { type: String },
  purpose: { type: String, required: true },
  imageUrl: { type: String },
  roomno: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '24h' } }, // Automatically deletes after 24 hours
  status: { type: Number, default: 0 },
  instatus: { type: Number, default: 0 },
});


const VisitorRequest = mongoose.model('VisitorRequest', VisitorRequestSchema);
export default VisitorRequest;


