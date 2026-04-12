import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';
import { trackGAEvent } from '@/lib/mailerliteService.js';
import { useToast } from '@/components/ui/use-toast.js';

const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all [color-scheme:light]";

const EarlyAccessForm = ({ buttonText = "Join the Founding List" }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    car: '',
    name: '',
    city: '',
    country: '',
    consent: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const { toast } = useToast();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormMessage(null);
  };

  // Step 1 — capture email immediately
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setFormMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);
    try {
      await apiServerClient.fetch('/mailerlite/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          groupId: '179693176552949655'
        })
      });
    } catch (err) {
      // non-fatal — still move to next step
    } finally {
      setIsLoading(false);
      setStep(2);
    }
  };

  // Final submit — update with full data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);

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

        trackGAEvent('early_access_signup', { email: formData.email, form_source: 'main' });
        setIsPendingConfirmation(true);
        setFormData({ email: '', car: '', name: '', city: '', country: '', consent: false });
        setStep(1);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      const genericError = err.message || 'Something went wrong. Please try again.';
      setFormMessage({ type: 'error', text: genericError });
      toast({ variant: "destructive", title: "Subscription Failed", description: genericError });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPendingConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto p-8 bg-white border border-gray-200 rounded-2xl text-center space-y-4"
      >
        <div className="w-16 h-16 bg-amber-700/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-amber-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Almost there — your place on the founding list is not confirmed until you verify your email.
        </h3>
        <p className="text-gray-600">
          Check your inbox now and click the confirmation link. Don't see it? Check your spam folder.
        </p>
        <button
          onClick={() => setIsPendingConfirmation(false)}
          className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-700/20 transition-all duration-200"
        >
          Got it, checking my inbox
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-4">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-amber-600' : s < step ? 'w-3 bg-amber-400' : 'w-3 bg-gray-300'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Step 1 — Email */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleEmailSubmit}
            className="space-y-3"
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address *"
              autoComplete="email"
              autoFocus
              className={inputClass}
            />
            {formMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-500 bg-red-500/10 border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{formMessage.text}</p>
              </motion.div>
            )}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-amber-700/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><span>Get Access</span><ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </motion.form>
        )}

        {/* Step 2 — Car */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-500 text-center">What car do you drive?</p>
            <input
              type="text"
              name="car"
              value={formData.car}
              onChange={handleChange}
              placeholder="e.g. Toyota Hilux, BMW X5"
              spellCheck={false}
              autoComplete="off"
              autoFocus
              className={inputClass}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">
                Skip
              </button>
              <motion.button type="button" onClick={() => setStep(3)} whileTap={{ scale: 0.98 }}
                className="flex-2 w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Next</span><ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Name */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-500 text-center">What's your name?</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              spellCheck={false}
              autoComplete="name"
              autoFocus
              className={inputClass}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(4)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">
                Skip
              </button>
              <motion.button type="button" onClick={() => setStep(4)} whileTap={{ scale: 0.98 }}
                className="flex-2 w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Next</span><ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4 — City/Country + Consent + Submit */}
        {step === 4 && (
          <motion.form
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <p className="text-sm text-gray-500 text-center">Where are you based?</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                spellCheck={false}
                autoComplete="off"
                className={inputClass}
              />
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                spellCheck={false}
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  name="consent"
                  id="early-access-consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all"
                />
                <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <label htmlFor="early-access-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                I agree to the{' '}
                <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">
                  Privacy Policy
                </Link>{' '}
                and consent to CarrVin collecting and processing my information.
              </label>
            </div>

            {formMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-500 bg-red-500/10 border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{formMessage.text}</p>
              </motion.div>
            )}

            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-amber-700/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : buttonText}
            </motion.button>
          </motion.form>
        )}

      </AnimatePresence>
    </div>
  );
};

export default EarlyAccessForm;