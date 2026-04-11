import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Explicitly point dotenv to the .env file next to this file
// This fixes the issue where process.cwd() is the project root, not apps/api/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try apps/api/.env first, then fall back to project root .env
const envPath = join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️ Could not load .env from ${envPath}, trying project root...`);
  dotenv.config(); // fallback to process.cwd()/.env
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

console.log('Environment check - MAILERLITE_API_KEY exists:', !!process.env.MAILERLITE_API_KEY);
console.log('Environment check - MAILERLITE_API_KEY length:', process.env.MAILERLITE_API_KEY?.length || 0);
console.log('API v3 starting...');

const app = express();

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

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes());

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 API Server running on http://localhost:${port}`);
});

export default app;