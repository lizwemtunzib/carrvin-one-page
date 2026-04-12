// ============================================================
// apps/api/src/main.js  —  Railway-safe ES Module entry point
// ============================================================

// ⚠️ ALL static imports are hoisted in ESM — dotenv MUST be
//    configured before any module reads process.env at load time.
//    On Railway, env vars are injected by the platform so dotenv
//    is only needed locally. Load it conditionally here.

import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import dotenv              from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── ENV LOADING ──────────────────────────────────────────────
// Railway injects real env vars; dotenv is dev-only.
// We configure it synchronously here, before any runtime code
// reads process.env (imports are already resolved by now, but
// their internal function calls happen later).
if (process.env.NODE_ENV !== 'production') {
  const envPath = join(__dirname, '../.env');
  const result  = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn(`⚠️  Could not load .env from ${envPath} — falling back to system env`);
  } else {
    console.log(`✅  Loaded .env from: ${envPath}`);
  }
}

// ── LATE IMPORTS (after env is configured) ───────────────────
import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';

import routes                from './routes/index.js';
import { errorMiddleware }   from './middleware/index.js';
import logger                from './utils/logger.js';

// ── STARTUP DIAGNOSTICS ──────────────────────────────────────
console.log('API starting...');
console.log('NODE_ENV               :', process.env.NODE_ENV);
console.log('PORT                   :', process.env.PORT);
console.log('POCKETBASE_URL         :', process.env.POCKETBASE_URL);
console.log('CORS_ORIGIN            :', process.env.CORS_ORIGIN);
console.log('MAILERLITE_API_KEY set :', !!process.env.MAILERLITE_API_KEY);
console.log('MAILERLITE_API_KEY len :', process.env.MAILERLITE_API_KEY?.length ?? 0);

// ── APP SETUP ────────────────────────────────────────────────
const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : '*',
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ───────────────────────────────────────────────────
app.use('/', routes());

// ── HEALTH CHECK (Railway / uptime monitors) ─────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status : 'ok',
    uptime : process.uptime(),
    time   : new Date().toISOString(),
  });
});

// ── ERROR HANDLERS ───────────────────────────────────────────
app.use(errorMiddleware);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── GLOBAL PROCESS HANDLERS ──────────────────────────────────
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — draining…');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit(0);
});

// ── SERVER START (Railway binds to 0.0.0.0 dynamically) ──────
const port = parseInt(process.env.PORT, 10) || 8080;

app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀  API running on port ${port}`);
  logger.info(`💚  Health check → /health`);
});

export default app;