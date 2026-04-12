import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => emailRegex.test(email);
const PB = process.env.POCKETBASE_URL || 'http://pb.carrvin.com';

logger.info(`PDF routes initialized with PocketBase URL: ${PB}`);

// ============================================================
// PDF ROUTES
// ============================================================

// POST /pdf/confirm-token
router.post('/confirm-token', async (req, res) => {
  logger.info('=== PDF confirm-token route hit ===');
  const { token } = req.body;
  logger.info(`Confirming token: ${token}`);
  if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

  try {
    logger.info(`Querying PocketBase for token: ${token}`);
    const findResponse = await axios.get(`${PB}/api/collections/pdf_downloads/records`, {
      params: { filter: `token="${token}"`, perPage: 1 }
    });
    logger.info(`PocketBase response received, items count: ${findResponse.data?.items?.length || 0}`);

    const items = findResponse.data?.items || [];
    if (items.length === 0) throw new Error('Token not found');

    const record = items[0];
    logger.info(`Found record with ID: ${record.id}, created: ${record.created}`);

    const hoursDiff = (Date.now() - new Date(record.created).getTime()) / (1000 * 60 * 60);
    logger.info(`Token age: ${hoursDiff.toFixed(2)} hours`);

    if (hoursDiff > 24) throw new Error('Token expired');

    logger.info(`Updating token record to confirmed: ${record.id}`);
    await axios.patch(`${PB}/api/collections/pdf_downloads/records/${record.id}`,
      { confirmed: true },
      { headers: { 'Content-Type': 'application/json' } }
    );
    logger.info('Token confirmed successfully');

    let pdfUrl = null;
    try {
      const specificRecordId = record.pdf_file || null;

      if (specificRecordId) {
        // Fetch the exact PDF record stored at form submission time
        logger.info(`Fetching specific PDF resource: ${specificRecordId}`);
        const resourceResponse = await axios.get(
          `${PB}/api/collections/resources/records/${specificRecordId}`
        );
        const resource = resourceResponse.data;
        if (resource?.file) {
          pdfUrl = `${PB}/api/files/${resource.collectionId}/${resource.id}/${resource.file}`;
          logger.info(`PDF URL constructed from specific record: ${pdfUrl}`);
        } else {
          logger.warn(`Specific resource ${specificRecordId} has no file`);
        }
      } else {
        // Fallback: original behaviour for records without pdf_file set
        logger.info('No pdf_file on record, falling back to active=true resource');
        const resourceResponse = await axios.get(`${PB}/api/collections/resources/records`, {
          params: { filter: 'active=true', perPage: 1 }
        });
        const resources = resourceResponse.data?.items || [];
        if (resources.length > 0 && resources[0].file) {
          const resource = resources[0];
          pdfUrl = `${PB}/api/files/${resource.collectionId}/${resource.id}/${resource.file}`;
          logger.info(`PDF URL constructed from fallback: ${pdfUrl}`);
        } else {
          logger.warn('No active resources found or resource has no file');
        }
      }
    } catch (resourceErr) {
      logger.warn('Could not fetch PDF resource:', resourceErr.message);
    }

    logger.info('Returning success response with PDF URL');
    return res.status(200).json({ success: true, pdfUrl });
  } catch (error) {
    logger.error('Error in confirm-token route:', error.message);
    throw error;
  }
});

// POST /pdf/send-pdf-confirmation-email
router.post('/send-pdf-confirmation-email', async (req, res) => {
  logger.info('=== PDF send-pdf-confirmation-email route hit ===');
  const { email, name, token } = req.body;
  logger.info(`Email: ${email}, Name: ${name}, Token: ${token}`);

  if (!email || !isValidEmail(email)) {
    logger.warn(`Invalid email provided: ${email}`);
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  if (!token) {
    logger.warn('No token provided');
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  logger.info(`PocketBase hook will send confirmation email for: ${email}`);
  return res.status(200).json({ success: true, message: 'Confirmation email queued', email, token });
});

// ============================================================
// BLOG ROUTES
// ============================================================

const PB_BLOG = 'blog_posts';

// GET /pdf/blog/posts - all published posts
router.get('/blog/posts', async (req, res) => {
  logger.info('=== GET /blog/posts route hit ===');
  logger.info(`Fetching all published blog posts from collection: ${PB_BLOG}`);

  try {
    logger.info(`Making axios GET request to: ${PB}/api/collections/${PB_BLOG}/records`);
    const response = await axios.get(`${PB}/api/collections/${PB_BLOG}/records`, {
      params: { filter: 'published=true', sort: '-created', perPage: 50 }
    });

    logger.info(`Response status: ${response.status}`);
    logger.info(`Retrieved ${response.data.items?.length || 0} published posts`);
    logger.info(`Response data keys: ${Object.keys(response.data).join(', ')}`);

    const responseData = { success: true, items: response.data.items || [] };
    logger.info(`Sending response: ${JSON.stringify(responseData).substring(0, 100)}...`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in GET /blog/posts:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// GET /pdf/blog/posts/all - all posts including drafts
router.get('/blog/posts/all', async (req, res) => {
  logger.info('=== GET /blog/posts/all route hit ===');
  logger.info(`Fetching all blog posts (including drafts) from collection: ${PB_BLOG}`);

  try {
    logger.info(`Making axios GET request to: ${PB}/api/collections/${PB_BLOG}/records`);
    const response = await axios.get(`${PB}/api/collections/${PB_BLOG}/records`, {
      params: { sort: '-created', perPage: 50 }
    });

    logger.info(`Response status: ${response.status}`);
    logger.info(`Retrieved ${response.data.items?.length || 0} total posts`);

    const responseData = { success: true, items: response.data.items || [] };
    logger.info(`Sending response with ${responseData.items.length} items`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in GET /blog/posts/all:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// GET /pdf/blog/posts/slug/:slug - single post by slug
router.get('/blog/posts/slug/:slug', async (req, res) => {
  logger.info('=== GET /blog/posts/slug/:slug route hit ===');
  const slug = req.params.slug;
  logger.info(`Fetching blog post with slug: ${slug}`);

  try {
    logger.info(`Making axios GET request to: ${PB}/api/collections/${PB_BLOG}/records`);
    const response = await axios.get(`${PB}/api/collections/${PB_BLOG}/records`, {
      params: { filter: `slug="${slug}"`, perPage: 1 }
    });

    logger.info(`Response status: ${response.status}`);
    const items = response.data.items || [];
    logger.info(`Retrieved ${items.length} items`);

    if (items.length === 0) {
      logger.warn(`No post found with slug: ${slug}`);
      throw new Error(`Post not found with slug: ${slug}`);
    }

    logger.info(`Found post: ${items[0].title}`);
    const responseData = { success: true, item: items[0] };
    logger.info(`Sending response with post ID: ${items[0].id}`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in GET /blog/posts/slug/:slug:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// GET /pdf/blog/posts/related/:slug
router.get('/blog/posts/related/:slug', async (req, res) => {
  logger.info('=== GET /blog/posts/related/:slug route hit ===');
  const slug = req.params.slug;
  const limit = parseInt(req.query.limit) || 3;
  logger.info(`Fetching related posts for slug: ${slug}, limit: ${limit}`);

  try {
    logger.info(`Making axios GET request to: ${PB}/api/collections/${PB_BLOG}/records`);
    const response = await axios.get(`${PB}/api/collections/${PB_BLOG}/records`, {
      params: { filter: `slug!="${slug}" && published=true`, sort: '-created', perPage: limit }
    });

    logger.info(`Response status: ${response.status}`);
    logger.info(`Retrieved ${response.data.items?.length || 0} related posts`);

    const responseData = { success: true, items: response.data.items || [] };
    logger.info(`Sending response with ${responseData.items.length} related posts`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in GET /blog/posts/related/:slug:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// POST /pdf/blog/posts - create post
router.post('/blog/posts', async (req, res) => {
  logger.info('=== POST /blog/posts route hit ===');
  logger.info(`Creating new blog post with data: ${JSON.stringify(req.body).substring(0, 100)}...`);

  try {
    logger.info(`Making axios POST request to: ${PB}/api/collections/${PB_BLOG}/records`);
    const response = await axios.post(
      `${PB}/api/collections/${PB_BLOG}/records`,
      { ...req.body, view_count: 0 },
      { headers: { 'Content-Type': 'application/json' } }
    );

    logger.info(`Response status: ${response.status}`);
    logger.info(`Created post with ID: ${response.data.id}`);

    const responseData = { success: true, item: response.data };
    logger.info(`Sending response with created post`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in POST /blog/posts:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// PATCH /pdf/blog/posts/:id - update post
router.patch('/blog/posts/:id', async (req, res) => {
  logger.info('=== PATCH /blog/posts/:id route hit ===');
  const id = req.params.id;
  logger.info(`Updating blog post: ${id}`);
  logger.info(`Update data: ${JSON.stringify(req.body).substring(0, 100)}...`);

  try {
    logger.info(`Making axios PATCH request to: ${PB}/api/collections/${PB_BLOG}/records/${id}`);
    const response = await axios.patch(
      `${PB}/api/collections/${PB_BLOG}/records/${id}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    logger.info(`Response status: ${response.status}`);
    logger.info(`Updated post: ${id}`);

    const responseData = { success: true, item: response.data };
    logger.info(`Sending response with updated post`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in PATCH /blog/posts/:id:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// DELETE /pdf/blog/posts/:id - delete post
router.delete('/blog/posts/:id', async (req, res) => {
  logger.info('=== DELETE /blog/posts/:id route hit ===');
  const id = req.params.id;
  logger.info(`Deleting blog post: ${id}`);

  try {
    logger.info(`Making axios DELETE request to: ${PB}/api/collections/${PB_BLOG}/records/${id}`);
    await axios.delete(`${PB}/api/collections/${PB_BLOG}/records/${id}`);

    logger.info(`Deleted post: ${id}`);

    const responseData = { success: true };
    logger.info(`Sending success response`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in DELETE /blog/posts/:id:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

// POST /pdf/blog/posts/:id/view - increment view count
router.post('/blog/posts/:id/view', async (req, res) => {
  logger.info('=== POST /blog/posts/:id/view route hit ===');
  const id = req.params.id;
  logger.info(`Incrementing view count for post: ${id}`);

  try {
    logger.info(`Making axios GET request to fetch current post: ${PB}/api/collections/${PB_BLOG}/records/${id}`);
    const getResponse = await axios.get(`${PB}/api/collections/${PB_BLOG}/records/${id}`);

    logger.info(`Response status: ${getResponse.status}`);
    const current = getResponse.data.view_count || 0;
    logger.info(`Current view count: ${current}`);

    logger.info(`Making axios PATCH request to update view count`);
    await axios.patch(
      `${PB}/api/collections/${PB_BLOG}/records/${id}`,
      { view_count: current + 1 },
      { headers: { 'Content-Type': 'application/json' } }
    );

    logger.info(`View count incremented for post: ${id}`);

    const responseData = { success: true };
    logger.info(`Sending success response`);

    res.json(responseData);
  } catch (error) {
    logger.error('Error in POST /blog/posts/:id/view:', error.message);
    if (error.response) {
      logger.error(`PocketBase error status: ${error.response.status}`);
      logger.error(`PocketBase error data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
});

export default router;
