import { Router } from 'express';
import PocketBase from 'pocketbase';
import logger from '../utils/logger.js';

const POCKETBASE_URL = (
    process.env.POCKETBASE_URL || 'http://pb.carrvin.com'
).replace(/\/$/, '');

class NotConfiguredError extends Error {}

let client = null;

// Deliberately NOT using src/utils/pocketbaseClient.js. That module
// authenticates at import time and calls process.exit(1) if PocketBase is
// unreachable or the superuser login fails — and nothing imported it, so that
// behaviour was dormant. Importing it here would make a PocketBase hiccup at
// boot kill the whole API, taking /subscribe, /pdf and /mailerlite down with
// it. This authenticates lazily and surfaces failures as HTTP errors instead.
async function getPocketBase() {
    const email = process.env.PB_SUPERUSER_EMAIL;
    const password = process.env.PB_SUPERUSER_PASSWORD;

    if (!email || !password) {
        throw new NotConfiguredError('PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD are not set');
    }

    if (!client) {
        client = new PocketBase(POCKETBASE_URL);
        client.autoCancellation(false);
    }

    if (!client.authStore.isValid) {
        await client.collection('_superusers').authWithPassword(email, password);
    }

    return client;
}

function fail(res, error, action) {
    if (error instanceof NotConfiguredError) {
        logger.error(`admin-blog: ${action} blocked — ${error.message}`);
        return res.status(503).json({ error: 'Blog storage is not configured' });
    }
    logger.error(`admin-blog: ${action} failed:`, error);
    return res.status(502).json({ error: `Could not ${action} post` });
}

// Admin-only blog CRUD.
//
// Writes have to happen here rather than in the browser: the blog_posts
// collection requires `@request.auth.id != ""` for create/update/delete, and
// the web app has no PocketBase session. This router uses the shared
// pocketbaseClient, which authenticates as the superuser via PB_SUPERUSER_*.
//
// Reads of PUBLISHED posts stay in the browser — listRule/viewRule are open,
// so the public blog needs no server round-trip and is untouched by this.
export default function createAdminBlogRouter(requireAdmin) {
    const router = Router();

    router.use(requireAdmin);

    // Every post, including unpublished drafts.
    router.get('/', async (_req, res) => {
        try {
            const pb = await getPocketBase();
            const items = await pb.collection('blog_posts').getFullList({ sort: '-created' });
            return res.json({ items });
        } catch (error) {
            return fail(res, error, 'load');
        }
    });

    router.post('/', async (req, res) => {
        try {
            const pb = await getPocketBase();
            const record = await pb.collection('blog_posts').create(req.body ?? {});
            logger.info(`admin-blog: created ${record.id}`);
            return res.status(201).json({ record });
        } catch (error) {
            return fail(res, error, 'create');
        }
    });

    router.patch('/:id', async (req, res) => {
        try {
            const pb = await getPocketBase();
            const record = await pb.collection('blog_posts').update(req.params.id, req.body ?? {});
            logger.info(`admin-blog: updated ${req.params.id}`);
            return res.json({ record });
        } catch (error) {
            return fail(res, error, 'update');
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const pb = await getPocketBase();
            await pb.collection('blog_posts').delete(req.params.id);
            logger.info(`admin-blog: deleted ${req.params.id}`);
            return res.json({ success: true });
        } catch (error) {
            return fail(res, error, 'delete');
        }
    });

    return router;
}
