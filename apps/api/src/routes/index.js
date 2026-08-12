import { Router } from 'express';
import crypto from 'crypto';
import healthCheck from './health-check.js';
import mailerliteRouter from './mailerlite.js';
import subscribeRouter from './subscribe.js';
import pdfRouter from './pdf.js';
import syncRouter from './sync.js';
import createAdminBlogRouter from './admin-blog.js';

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

        const expectedEmail = process.env.ADMIN_EMAIL;
        const expectedPassword = process.env.ADMIN_PASSWORD;
        const secret = getAuthSecret();

        // Fail closed when unconfigured. The previous version compared with
        // `===` against process.env directly, so with ADMIN_EMAIL and
        // ADMIN_PASSWORD unset a request with no body satisfied
        // `undefined === undefined` twice over and was issued a token.
        if (!expectedEmail || !expectedPassword || !secret) {
            console.error('[auth] admin login is not configured (needs ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET).');
            return res.status(503).json({ error: 'Admin login is not configured' });
        }

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !safeEqual(email, expectedEmail) ||
            !safeEqual(password, expectedPassword)
        ) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(email, secret);
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
