import { Router } from 'express';
import crypto from 'crypto';
import healthCheck from './health-check.js';
import mailerliteRouter from './mailerlite.js';
import subscribeRouter from './subscribe.js';
import pdfRouter from './pdf.js';
import syncRouter from './sync.js';

const router = Router();

// Simple token generator using built-in crypto - no npm install needed
function generateToken(email) {
    const payload = JSON.stringify({ email, exp: Date.now() + 86400000 }); // 24hrs
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    const token = Buffer.from(payload).toString('base64') + '.' + signature;
    return token;
}

function verifyToken(token) {
    try {
        const [encodedPayload, signature] = token.split('.');
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
        
        // Check expiry
        if (Date.now() > payload.exp) return null;
        
        // Verify signature
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        const expectedSignature = hmac.digest('hex');
        
        if (signature !== expectedSignature) return null;
        return payload;
    } catch {
        return null;
    }
}

export default () => {
    router.get('/health', healthCheck);
    
    router.use('/mailerlite', mailerliteRouter);
    router.use('/subscribe', subscribeRouter);
    router.use('/pdf', pdfRouter);
    router.use('/sync', syncRouter);

    // Admin login route
    router.post('/admin/login', (req, res) => {
        const { email, password } = req.body;

        if (
            email === process.env.ADMIN_EMAIL &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const token = generateToken(email);
            return res.json({ token });
        }

        return res.status(401).json({ error: 'Invalid credentials' });
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
