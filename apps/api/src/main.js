import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env safely (no crash if missing)
const envPath = join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️ Could not load .env from ${envPath}, falling back to system env`);
  dotenv.config();
} else {
  console.log(`✅ Loaded .env from: ${envPath}`);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';

console.log('API starting...');
console.log('MAILERLITE_API_KEY exists:', !!process.env.MAILERLITE_API_KEY);
console.log('MAILERLITE_API_KEY length:', process.env.MAILERLITE_API_KEY?.length || 0);

const app = express();

/* -------------------------
   CRASH HANDLERS
--------------------------*/
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit(0);
});

/* -------------------------
   MIDDLEWARE
--------------------------*/
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*',
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------
   ROUTES
--------------------------*/
app.use('/', routes());

/* -------------------------
   HEALTH CHECK (IMPORTANT FOR RAILWAY)
--------------------------*/
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

/* -------------------------
   ERROR HANDLER
--------------------------*/
app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* -------------------------
   START SERVER (FIXED FOR RAILWAY)
--------------------------*/
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 API Server running on port ${port}`);
  logger.info(`🌐 Health check: /health`);
});

export default app;