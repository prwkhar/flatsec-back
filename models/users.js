import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name:{type: String},
  phoneno:{type: String},
  permission:{type: Boolean,default: true},
  email: { type: String, required: true, unique: true },
  // Store the password as a bcrypt-hashed string.
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'security','admin'], required: true },
  roomno: { 
    type: Number
  },
  address:{
    type:String,
  }
});

const User = mongoose.model('User', UserSchema);
export default User;
