import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

dotenv.config();

import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Should be restricted in production
  }
});

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const prisma = new PrismaClient();

import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import sosRoutes from './routes/sosRoutes';
import adminRoutes from './routes/adminRoutes';

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
