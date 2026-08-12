import { Router } from 'express';
import crypto from 'crypto';
import healthCheck from './health-check.js';
import mailerliteRouter from './mailerlite.js';
import subscribeRouter from './subscribe.js';
import pdfRouter from './pdf.js';
import syncRouter from './sync.js';
import createAdminBlogRouter from './admin-blog.js';
import logger from '../utils/logger.js';

const router = Router();

// Returns the signing secret, or null if it is not configured.
//
// There used to be a `|| 'fallback_secret'` default here. That is a published
// string in a public repo: with JWT_SECRET unset, anyone could mint a token
// this service would accept. Admin auth now fails CLOSED instead — and only
// admin auth, so /subscribe, /pdf and /mailerlite keep working regardless.
function getAuthSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('[auth] JWT_SECRET is not set — admin auth is disabled until it is configured.');
        return null;
    }
    return secret;
}

// Constant-time compare. Hashing first keeps both sides a fixed length, so
// this leaks neither the value nor its length.
function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

// Simple token generator using built-in crypto - no npm install needed
function generateToken(email, secret) {
    const payload = JSON.stringify({ email, exp: Date.now() + 86400000 }); // 24hrs
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    const token = Buffer.from(payload).toString('base64') + '.' + signature;
    return token;
}

function verifyToken(token) {
    try {
        const secret = getAuthSecret();
        if (!secret) return null;

        const [encodedPayload, signature] = token.split('.');
        if (!encodedPayload || !signature) return null;

        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());

        // Check expiry
        if (Date.now() > payload.exp) return null;

        // Verify signature
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        const expectedSignature = hmac.digest('hex');

        if (!safeEqual(signature, expectedSignature)) return null;
        return payload;
    } catch {
        return null;
    }
}

// Express middleware form of verifyToken, for routes that require an admin.
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });

    req.admin = decoded;
    return next();
}

export default () => {
    router.get('/health', healthCheck);
    
    router.use('/mailerlite', mailerliteRouter);
    router.use('/subscribe', subscribeRouter);
    router.use('/pdf', pdfRouter);
    router.use('/sync', syncRouter);
    router.use('/admin/blog', createAdminBlogRouter(requireAdmin));

    // Admin login route
    router.post('/admin/login', (req, res) => {
        const { email, password } = req.body ?? {};

        // Trimmed because a trailing space or newline pasted into a dashboard
        // env var is never intentional, and is invisible when you look at it.
        const rawEmail = process.env.ADMIN_EMAIL;
        const rawPassword = process.env.ADMIN_PASSWORD;
        const expectedEmail = (rawEmail || '').trim();
        const expectedPassword = (rawPassword || '').trim();
        const secret = getAuthSecret();

        // Fail closed when unconfigured. The previous version compared with
        // `===` against process.env directly, so with ADMIN_EMAIL and
        // ADMIN_PASSWORD unset a request with no body satisfied
        // `undefined === undefined` twice over and was issued a token.
        if (!expectedEmail || !expectedPassword || !secret) {
            console.error('[auth] admin login is not configured (needs ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET).');
            return res.status(503).json({ error: 'Admin login is not configured' });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Email is compared case- and whitespace-insensitively (neither is ever
        // a meaningful difference in an address). The password is compared
        // exactly, except for whitespace around the STORED value.
        const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase());
        const passwordOk = safeEqual(password, expectedPassword);

        if (!emailOk || !passwordOk) {
            // Logged server-side only — the HTTP response must never reveal
            // which field was wrong. These land in the Railway service logs and
            // are what make an otherwise invisible mismatch diagnosable.
            logger.warn(
                `[auth] admin login rejected — email matched: ${emailOk}, password matched: ${passwordOk}`,
            );
            if (rawEmail !== expectedEmail) {
                logger.warn('[auth] ADMIN_EMAIL has surrounding whitespace in the environment (trimmed before comparing)');
            }
            if (rawPassword !== expectedPassword) {
                logger.warn('[auth] ADMIN_PASSWORD has surrounding whitespace in the environment (trimmed before comparing)');
            }
            if (!passwordOk && password !== password.trim()) {
                logger.warn('[auth] the submitted password has surrounding whitespace');
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(expectedEmail, secret);
        return res.json({ token });
    });

    // Admin token verify route
    router.get('/admin/verify', (req, res) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token' });

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });
        return res.json({ valid: true, email: decoded.email });
    });

    return router;
};
