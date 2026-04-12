import express from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => emailRegex.test(email);

router.post('/', async (req, res) => {
  logger.info('Subscribe endpoint called with body: ' + JSON.stringify(req.body));

  const { email, name, city, country, privacy_consent, groupId, source, status } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  if (!privacy_consent) {
    return res.status(400).json({ success: false, message: 'Privacy consent is required' });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    logger.error('MAILERLITE_API_KEY is missing');
    throw new Error('Server configuration error: MAILERLITE_API_KEY not found');
  }

  const subscriberPayload = {
    email,
    fields: {
      name: name || '',
      city: city || '',
      country: country || '',
      source: source || 'website'
    },
    status: status || 'active',
    resubscribe: true,       // ensures re-subscription triggers automation
    autoresponders: true     // ensures automation emails fire
  };

  if (groupId) {
    subscriberPayload.groups = [groupId];
    logger.info(`Adding subscriber to group: ${groupId}`);
  } else {
    logger.info('No groupId provided - subscriber will not be added to any group');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
  };

  try {
    const response = await axios.post(
      'https://connect.mailerlite.com/api/subscribers',
      subscriberPayload,
      { headers }
    );

    logger.info('MailerLite response status: ' + response.status);

    res.status(200).json({
      success: true,
      message: 'Subscribed successfully',
      group: groupId || 'none'
    });

  } catch (error) {
    if (error.response?.status === 409) {
      logger.info('Subscriber already exists, updating and adding to group');

      try {
        const updatePayload = {
          fields: {
            name: name || '',
            city: city || '',
            country: country || '',
            source: source || 'website'
          },
          resubscribe: true,     // critical: triggers automation for existing subscribers
          autoresponders: true   // critical: fires automation emails
        };

        if (groupId) {
          updatePayload.groups = [groupId];
          logger.info(`Adding existing subscriber to group: ${groupId}`);
        }

        const updateResponse = await axios.put(
          `https://connect.mailerlite.com/api/subscribers/${email}`,
          updatePayload,
          { headers }
        );

        logger.info('MailerLite update response: ' + updateResponse.status);

        // Explicitly assign to group to guarantee membership
        if (groupId) {
          try {
            const subscriberId = updateResponse.data?.data?.id;
            if (subscriberId) {
              await axios.post(
                `https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${groupId}`,
                {},
                { headers }
              );
              logger.info(`Explicitly added subscriber ${subscriberId} to group ${groupId}`);
            }
          } catch (groupError) {
            logger.warn('Could not explicitly add to group:', groupError.message);
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Subscriber updated successfully',
          existing: true,
          group: groupId || 'none'
        });

      } catch (updateError) {
        logger.error('Error updating subscriber:', updateError.response?.data || updateError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to update subscriber'
        });
      }
    }

    logger.error('MailerLite API error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Subscription failed',
      error: error.response?.data || error.message
    });
  }
});

export default router;
