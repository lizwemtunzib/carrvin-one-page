import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import apiServerClient from '@/lib/apiServerClient';

const inputClass = "w-full px-6 py-4 bg-white border-2 border-gray-400 shadow-sm rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all duration-300 [color-scheme:light]";

const EmailSignupForm = ({
  buttonText = "Join the Founding List",
  showNameField = true
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', name: '', consent: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);
    try {
      await apiServerClient.fetch('/mailerlite/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, privacy_consent: true })
      });
    } catch (err) { /* non-fatal */ } finally {
      setIsLoading(false);
      if (showNameField) {
        setStep(2);
      } else {
        // no name field — go straight to consent/submit
        setStep(3);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      setErrors({ consent: 'You must agree to the privacy policy to continue.' });
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
          privacy_consent: formData.consent
        })
      });
      const data = await response.json();
      if (response.status === 200 && data.success) {
        setIsPendingConfirmation(true);
        setFormData({ email: '', name: '', consent: false });
        setStep(1);
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Subscription Failed", description: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPendingConfirmation) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Almost there — your place on the founding list is not confirmed until you verify your email.</h3>
        <p className="text-gray-600">Check your inbox now and click the confirmation link. Don't see it? Check your spam folder.</p>
        <button onClick={() => setIsPendingConfirmation(false)}
          className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all">
          Got it, checking my inbox
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center gap-2 mb-4">
        {[1, showNameField ? 2 : null, 3].filter(Boolean).map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-amber-600' : s < step ? 'w-3 bg-amber-400' : 'w-3 bg-gray-300'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email Address" autoFocus
                className={`w-full px-6 py-4 bg-white border-2 [color-scheme:light] ${errors.email ? 'border-red-500' : 'border-gray-400'} shadow-sm rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all`} />
              {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
            </div>
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><span>{buttonText}</span><ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </motion.form>
        )}

        {step === 2 && showNameField && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">What's your name?</p>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" autoFocus className={inputClass} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">Skip</button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Next</span><ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3 pt-1">
              <div className="relative flex items-center mt-0.5">
                <input type="checkbox" name="consent" id="email-signup-consent" checked={formData.consent} onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-400 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all" />
                <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <label htmlFor="email-signup-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                I agree to the{' '}
                <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">Privacy Policy</Link>{' '}
                and consent to CarrVin collecting and processing my information.
              </label>
            </div>
            {errors.consent && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{errors.consent}</p>}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : buttonText}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailSignupForm;