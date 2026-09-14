import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease ensure all required variables are set in your .env file.');
  process.exit(1);
}

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Health check route
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      app: 'Lunara',
      description: 'Moonlit Emotional Journal',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      app: 'Lunara',
      database: 'disconnected',
      message: 'Unable to connect to database',
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Lunara API is running!');
});

import authRoutes from './routes/authRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import imageUploadRoutes from './routes/imageUploadRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/upload', imageUploadRoutes);
app.use('/api/users', userRoutes);

// Warm-up endpoint
app.get('/api/warmup', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('Server warmed up');
  } catch (error) {
    res.status(500).send('Error warming up server');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Lunara server running on port ${PORT}`);
});

// Handle Prisma disconnect on server shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
