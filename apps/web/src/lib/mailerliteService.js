export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const checkDuplicateSubscription = async (email) => {
  try {
    const apiKey = import.meta.env.VITE_MAILERLITE_API_KEY;
    if (!apiKey) {
      console.warn('MailerLite API key missing for duplicate check.');
      return false;
    }
    
    const response = await fetch(`https://api.mailerlite.com/api/v2/subscribers/${email}`, {
      method: 'GET',
      headers: {
        'X-MailerLite-ApiKey': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      return true; // Subscriber exists
    }
    return false;
  } catch (error) {
    console.error('Error checking duplicate subscription:', error);
    return false;
  }
};

export const subscribeToMailerLite = async (email, groupId) => {
  try {
    const response = await fetch('https://api.mailerlite.com/api/v1/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, groupId })
    });
    
    if (!response.ok) {
      throw new Error(`MailerLite API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error subscribing to MailerLite:', error);
    throw error;
  }
};

export const trackGAEvent = (eventName, eventData) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventData);
    } else {
      console.warn('Google Analytics not initialized. Event not tracked:', eventName, eventData);
    }
  } catch (error) {
    console.error('Error tracking GA event:', error);
  }
};
