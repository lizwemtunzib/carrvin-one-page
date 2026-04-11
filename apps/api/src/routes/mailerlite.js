import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => emailRegex.test(email);
const maskApiKey = (key) => {
  if (!key || key.length < 10) return '***MASKED***';
  return `${key.substring(0, 10)}...${key.substring(key.length - 5)}`;
};

// ============================================================
// DEBUG — remove this route once API key issue is resolved
// ============================================================
router.get('/debug-env', (req, res) => {
  const key = process.env.MAILERLITE_API_KEY;
  res.json({
    key_exists: !!key,
    key_length: key ? key.length : 0,
    key_start: key ? key.substring(0, 15) : 'MISSING',
    key_end: key ? key.substring(key.length - 5) : 'MISSING',
    node_env: process.env.NODE_ENV
  });
});

// ============================================================
// TEST AUTH
// ============================================================
router.get('/test-auth', async (req, res) => {
  logger.info('=== MailerLite Auth Test Started ===');
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    logger.error('MAILERLITE_API_KEY not found in environment');
    return res.status(500).json({ success: false, message: 'API key not configured' });
  }
  logger.info(`Using API Key: ${maskApiKey(apiKey)}`);
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };
  try {
    const response = await axios.get('https://connect.mailerlite.com/api/subscribers?limit=1', { headers });
    return res.json({ success: true, message: 'API key is valid', data: { total_subscribers: response.data.meta?.total || 0 } });
  } catch (error) {
    logger.error('Auth test failed:', error.message);
    return res.status(error.response?.status || 500).json({ success: false, message: 'Failed to connect to MailerLite API', error: error.response?.data || error.message });
  }
});

router.post('/subscribe', async (req, res) => {
  logger.info('=== MailerLite Subscribe Request ===');
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { email, name, city, country, privacy_consent, groupId } = req.body;
  logger.info(`Processing subscription for: ${email}`);

  if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
  if (!privacy_consent) return res.status(400).json({ error: 'Privacy consent is required' });

  // Use groupId from request body, fall back to env default
  const resolvedGroupId = groupId || process.env.MAILERLITE_GROUP_ID || '17969317655294965';
  logger.info(`Using group ID: ${resolvedGroupId}`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json'
  };

  const checkEndpoint = `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`;
  try {
    const checkResponse = await axios.get(checkEndpoint, { headers });
    if (checkResponse.status === 200 && checkResponse.data?.data?.id) {
      logger.warn(`Subscriber already exists: ${email}`);
      return res.status(409).json({ success: false, error: 'This email is already registered.' });
    }
  } catch (checkError) {
    if (checkError.response?.status === 404) {
      logger.info('Subscriber does not exist, proceeding to create.');
    } else {
      logger.error('Error checking subscriber:', checkError.message);
      return res.status(checkError.response?.status || 500).json({ error: 'Error checking subscriber' });
    }
  }

  const payload = {
    email,
    fields: {
      name: name || '',
      city: city || '',
      country: country || ''
    },
    groups: [resolvedGroupId],
    status: 'unconfirmed',
    resubscribe: true,
    autoresponders: true
  };

  logger.info(`Creating subscriber with group: ${resolvedGroupId}`);

  try {
    const response = await axios.post('https://connect.mailerlite.com/api/subscribers', payload, { headers });
    logger.info('Create response status:', response.status);

    if (response.status === 200 || response.status === 201) {
      return res.status(200).json({
        success: true,
        message: 'Subscriber created successfully.',
        subscriberId: response.data.data.id,
        subscriber: response.data.data
      });
    } else {
      return res.status(response.status).json({ error: 'Failed to subscribe' });
    }
  } catch (error) {
    logger.error('Subscribe API Error:', error.message);
    if (error.response) {
      logger.error('Error Data:', JSON.stringify(error.response.data));
      return res.status(error.response.status || 500).json({ error: error.response.data?.message || 'MailerLite API error' });
    }
    return res.status(500).json({ error: 'Internal server error during subscription' });
  }
});

export default router;