import 'dotenv/config';
import express from 'express';
import PocketBase from 'pocketbase';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize PocketBase instances
const devUrl = process.env.POCKETBASE_DEV_URL;
const liveUrl = process.env.POCKETBASE_LIVE_URL;

if (!devUrl || !liveUrl) {
  logger.error('POCKETBASE_DEV_URL or POCKETBASE_LIVE_URL not configured');
}

// POST /sync/sync-blog-posts
router.post('/sync-blog-posts', async (req, res) => {
  logger.info('=== Blog Posts Sync Started ===');
  const { force } = req.body || {};
  logger.info(`Force sync: ${force || false}`);

  if (!devUrl || !liveUrl) {
    throw new Error('PocketBase URLs not configured: POCKETBASE_DEV_URL and POCKETBASE_LIVE_URL required');
  }

  // Initialize PocketBase clients
  const pbDev = new PocketBase(devUrl);
  const pbLive = new PocketBase(liveUrl);

  let synced = 0;
  let updated = 0;
  let deleted = 0;

  // Step 1: Fetch all blog posts from dev
  logger.info('Fetching all blog posts from development PocketBase...');
  const devPosts = await pbDev.collection('blog_posts').getFullList();
  logger.info(`Retrieved ${devPosts.length} posts from development`);

  // Step 2: Fetch all blog posts from live
  logger.info('Fetching all blog posts from live PocketBase...');
  const livePosts = await pbLive.collection('blog_posts').getFullList();
  logger.info(`Retrieved ${livePosts.length} posts from live`);

  // Create a map of live posts by slug for quick lookup
  const livePostsBySlug = new Map();
  livePosts.forEach(post => {
    livePostsBySlug.set(post.slug, post);
  });

  // Step 3: Sync dev posts to live (create or update)
  logger.info('Starting sync of development posts to live...');
  for (const devPost of devPosts) {
    const livePost = livePostsBySlug.get(devPost.slug);

    if (livePost) {
      // Post exists in live - update it
      logger.info(`Updating existing post: ${devPost.slug} (ID: ${livePost.id})`);
      await pbLive.collection('blog_posts').update(livePost.id, devPost);
      logger.info(`Successfully updated post: ${devPost.slug}`);
      updated++;
      livePostsBySlug.delete(devPost.slug); // Mark as processed
    } else {
      // Post doesn't exist in live - create it
      logger.info(`Creating new post: ${devPost.slug}`);
      const createdPost = await pbLive.collection('blog_posts').create(devPost);
      logger.info(`Successfully created post: ${devPost.slug} (ID: ${createdPost.id})`);
      synced++;
    }
  }

  // Step 4: Delete posts from live that don't exist in dev
  logger.info('Checking for posts to delete from live...');
  const postsToDelete = Array.from(livePostsBySlug.values());
  logger.info(`Found ${postsToDelete.length} posts in live that don't exist in dev`);

  for (const livePost of postsToDelete) {
    logger.info(`Deleting post from live: ${livePost.slug} (ID: ${livePost.id})`);
    await pbLive.collection('blog_posts').delete(livePost.id);
    logger.info(`Successfully deleted post: ${livePost.slug}`);
    deleted++;
  }

  logger.info('=== Blog Posts Sync Completed Successfully ===');
  logger.info(`Summary - Synced: ${synced}, Updated: ${updated}, Deleted: ${deleted}`);

  return res.json({
    success: true,
    synced,
    updated,
    deleted,
    message: `Sync completed: ${synced} created, ${updated} updated, ${deleted} deleted`
  });
});

// POST /sync/blog-posts - Individual blog post sync (create, update, or delete)
router.post('/blog-posts', async (req, res) => {
  logger.info('=== Blog Post Individual Sync Started ===');
  const { action, postId, postData } = req.body;
  logger.info(`Action: ${action}, PostId: ${postId}`);

  if (!liveUrl) {
    throw new Error('PocketBase Live URL not configured: POCKETBASE_LIVE_URL required');
  }

  // Validate action
  if (!action || !['create', 'update', 'delete'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Must be one of: create, update, delete'
    });
  }

  // Validate postId for update and delete
  if ((action === 'update' || action === 'delete') && !postId) {
    return res.status(400).json({
      success: false,
      message: 'postId is required for update and delete actions'
    });
  }

  // Validate postData for create and update
  if ((action === 'create' || action === 'update') && !postData) {
    return res.status(400).json({
      success: false,
      message: 'postData is required for create and update actions'
    });
  }

  const pbLive = new PocketBase(liveUrl);

  if (action === 'create') {
    logger.info('Creating new blog post in Live PocketBase...');
    logger.info(`Post data: ${JSON.stringify(postData).substring(0, 100)}...`);
    const createdPost = await pbLive.collection('blog_posts').create(postData);
    logger.info(`Successfully created post with ID: ${createdPost.id}`);
    return res.json({
      success: true,
      message: 'Blog post created successfully',
      postId: createdPost.id
    });
  }

  if (action === 'update') {
    logger.info(`Updating blog post with ID: ${postId}`);
    logger.info(`Update data: ${JSON.stringify(postData).substring(0, 100)}...`);
    const updatedPost = await pbLive.collection('blog_posts').update(postId, postData);
    logger.info(`Successfully updated post with ID: ${postId}`);
    return res.json({
      success: true,
      message: 'Blog post updated successfully',
      postId: updatedPost.id
    });
  }

  if (action === 'delete') {
    logger.info(`Deleting blog post with ID: ${postId}`);
    await pbLive.collection('blog_posts').delete(postId);
    logger.info(`Successfully deleted post with ID: ${postId}`);
    return res.json({
      success: true,
      message: 'Blog post deleted successfully',
      postId
    });
  }
});

export default router;