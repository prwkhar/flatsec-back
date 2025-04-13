import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

// Import routes
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { ownerRouter } from './routes/owner.js';
import { securityRouter } from './routes/security.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/security', securityRouter);
app.use('/api/admin',adminRouter);

// Setup Socket.IO for real-time notifications
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// Make io globally available (for emitting events from routes)
global.io = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default io;
