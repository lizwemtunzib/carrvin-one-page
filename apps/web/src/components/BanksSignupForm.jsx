import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient';
import { trackGAEvent } from '@/lib/mailerliteService.js';
import { useToast } from '@/components/ui/use-toast.js';

const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-400 shadow-sm rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all [color-scheme:light]";

const BanksSignupForm = ({ closeDialog }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', company: '', role: '', name: '', consent: false
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
        body: JSON.stringify({ email: formData.email, privacy_consent: true, groupId: '182655154034575280' })
      });
    } catch (err) { /* non-fatal */ } finally {
      setIsLoading(false);
      setStep(2);
    }
  };

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
          email: formData.email, name: formData.name, company: formData.company,
          role: formData.role, privacy_consent: formData.consent, groupId: '182655154034575280'
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
      const data = await response.json();
      if (data.success) {
        trackGAEvent('stakeholder_signup', { email: formData.email, stakeholder_type: 'banks' });
        setIsPendingConfirmation(true);
        setFormData({ email: '', company: '', role: '', name: '', consent: false });
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
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full p-8 bg-amber-50 border border-amber-400 rounded-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-slate-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Almost there — please verify your email.</h3>
        <p className="text-gray-600">Check your inbox and click the confirmation link. Don't see it? Check your spam folder.</p>
        <button onClick={() => { setIsPendingConfirmation(false); if (closeDialog) closeDialog(); }}
          className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all">
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full bg-amber-50 border border-amber-400 rounded-2xl p-6">

      <div className="flex justify-center gap-2 mb-4">
        {[1,2,3,4].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-amber-600' : s < step ? 'w-3 bg-amber-400' : 'w-3 bg-gray-300'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {step === 1 && (
          <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="space-y-3">
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Work Email Address *" autoComplete="email" autoFocus className={inputClass} />
            {formMessage && <div className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-700 bg-red-50 border-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{formMessage.text}</p></div>}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><span>Get Started</span><ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Which company are you with?</p>
            <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Company Name" spellCheck={false} autoComplete="organization" autoFocus className={inputClass} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">Skip</button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Next</span><ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <p className="text-sm text-gray-500 text-center">What's your role?</p>
            <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Role / Title" spellCheck={false} autoComplete="organization-title" autoFocus className={inputClass} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">Skip</button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Next</span><ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.form key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Your name?</p>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" spellCheck={false} autoComplete="name" autoFocus className={inputClass} />
            <div className="flex items-start gap-3 pt-1">
              <div className="relative flex items-center mt-0.5">
                <input type="checkbox" name="consent" id="banks-consent" checked={formData.consent} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-400 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all" />
                <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <label htmlFor="banks-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                I agree to the{' '}
                <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">Privacy Policy</Link>{' '}
                and consent to CarrVin collecting and processing my information.
              </label>
            </div>
            {formMessage && <div className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-700 bg-red-50 border-red-300"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{formMessage.text}</p></div>}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : 'Submit'}
            </motion.button>
          </motion.form>
        )}

      </AnimatePresence>
    </div>
  );
};

export default BanksSignupForm;