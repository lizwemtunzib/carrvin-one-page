import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';
import { trackGAEvent } from '@/lib/mailerliteService.js';
import { useToast } from '@/components/ui/use-toast.js';

const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all [color-scheme:light]";

const EarlyAccessPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    city: '',
    country: '',
    car: '',
    consent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const isDismissed = useRef(false);
  const timerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('carrvin_popup_dismissed')) {
      isDismissed.current = true;
      return;
    }

    const showPopup = () => {
      if (isDismissed.current) return;
      setIsVisible(true);
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleScroll = () => {
      if (isDismissed.current) return;
      const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollDepth >= 40) showPopup();
    };

    timerRef.current = setTimeout(showPopup, 10000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const closeAndDismiss = () => {
    isDismissed.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
    setIsPendingConfirmation(false);
    localStorage.setItem('carrvin_popup_dismissed', 'true');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setFormMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim()) {
      setFormMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (!formData.consent) {
      setFormMessage({ type: 'error', text: 'You must agree to the privacy policy to continue.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiServerClient.fetch('/mailerlite/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          city: formData.city,
          country: formData.country,
          car: formData.car,
          privacy_consent: formData.consent,
          groupId: '179693176552949655'
        })
      });

      if (response.status === 409) {
        setFormMessage({ type: 'error', text: 'This email is already registered. Check your inbox for the confirmation link.' });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();

      if (data.success) {
        try {
          const existingPdfRecords = await pb.collection('pdf_downloads').getList(1, 1, {
            filter: `email = "${formData.email}"`,
            $autoCancel: false
          });
          if (existingPdfRecords.items.length === 0) {
            await pb.collection('pdf_downloads').create({
              email: formData.email,
              confirmed: false
            }, { $autoCancel: false });
          }
        } catch (pdfErr) {
          console.error('PDF record creation error:', pdfErr);
        }

        trackGAEvent('early_access_signup', { email: formData.email, form_source: 'popup' });
        setIsPendingConfirmation(true);
        isDismissed.current = true;
        localStorage.setItem('carrvin_popup_dismissed', 'true');
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setFormMessage({ type: 'error', text: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg p-8 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/40 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={closeAndDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isPendingConfirmation ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-700/10 border border-amber-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Almost there — your place on the founding list is not confirmed until you verify your email.
                </h3>
                {/* Added spam note */}
                <p className="text-gray-600 mb-6">
                  Check your inbox now and click the confirmation link. Don't see it? Check your spam folder.
                </p>
                <button
                  onClick={closeAndDismiss}
                  className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-700/20 transition-all duration-200"
                >
                  Got it, checking my inbox
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-3">
                    <p className="text-orange-600 text-xs font-semibold">1,000 founding spots — then this closes</p>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Founding List</h3>
                  <p className="text-gray-600 text-sm">Priority access. Founding pricing. Locked in permanently before public launch.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    spellCheck={false}
                    autoComplete="off"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    autoComplete="email"
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City *"
                      spellCheck={false}
                      autoComplete="off"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country *"
                      spellCheck={false}
                      autoComplete="off"
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    name="car"
                    value={formData.car}
                    onChange={handleChange}
                    placeholder="What car do you drive? (e.g. Toyota Hilux)"
                    spellCheck={false}
                    autoComplete="off"
                    className={inputClass}
                  />

                  <div className="flex items-start gap-3 pt-1">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        name="consent"
                        id="popup-consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all"
                      />
                      <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <label htmlFor="popup-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                      I agree to the{' '}
                      <Link to="/privacy" onClick={closeAndDismiss} className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">
                        Privacy Policy
                      </Link>{' '}
                      and consent to CarrVin collecting and processing my information for updates.
                    </label>
                  </div>

                  {formMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-500 bg-red-500/10 border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p>{formMessage.text}</p>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-700/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
                      : 'Join the Founding List'
                    }
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EarlyAccessPopup;
