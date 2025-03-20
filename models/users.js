import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  // Store the password as a bcrypt-hashed string.
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'security'], required: true },
});

const User = mongoose.model('User', UserSchema);
export default User;
