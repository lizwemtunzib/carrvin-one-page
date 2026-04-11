import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient';
import { trackGAEvent } from '@/lib/mailerliteService.js';
import { useToast } from '@/components/ui/use-toast.js';

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/30 transition-all";

const BlogSignupSection = () => {
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
  const { toast } = useToast();

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
      const msg = 'Please enter a valid email address.';
      setFormMessage({ type: 'error', text: msg });
      toast({ variant: "destructive", title: "Validation Error", description: msg });
      return;
    }
    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim()) {
      const msg = 'Please fill in all required fields.';
      setFormMessage({ type: 'error', text: msg });
      toast({ variant: "destructive", title: "Validation Error", description: msg });
      return;
    }
    if (!formData.consent) {
      const msg = 'You must agree to the privacy policy to continue.';
      setFormMessage({ type: 'error', text: msg });
      toast({ variant: "destructive", title: "Privacy Consent", description: msg });
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
        const errorMsg = 'This email is already registered. Check your inbox for the confirmation link.';
        setFormMessage({ type: 'error', text: errorMsg });
        toast({ variant: "destructive", title: "Already Registered", description: errorMsg });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();

      if (data.success) {
        trackGAEvent('blog_signup', { email: formData.email, form_source: 'blog' });
        setIsPendingConfirmation(true);
        setFormData({ email: '', name: '', city: '', country: '', car: '', consent: false });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
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
        className="w-full max-w-2xl mx-auto p-8 bg-white border border-gray-200 rounded-2xl text-center space-y-4 my-12"
      >
        <div className="w-16 h-16 bg-amber-700/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-amber-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Almost there — your spot is not locked until you confirm.
        </h3>
        <p className="text-gray-600">
          Check your inbox now and click the confirmation link. Don't see it? Check your spam folder.
        </p>
        <button
          onClick={() => setIsPendingConfirmation(false)}
          className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-dark-primary rounded-lg hover:shadow-lg hover:shadow-amber-700/20 transition-all duration-200"
        >
          Got it, checking my inbox
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white border border-gray-200 rounded-2xl shadow-2xl my-12">
      <div className="text-center mb-6">
        <div className="inline-block px-3 py-1 bg-amber-700/10 border border-amber-700/20 rounded-full mb-3">
          <p className="text-amber-700 text-xs font-semibold">1,000 founding spots — then this closes</p>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Don't Just Read About It — Be Part of the Solution.</h3>
        <p className="text-gray-600 text-sm">
          Every article on this site describes a threat that existing security was not built for. CarrVin is. Founding members get priority access and pricing that will not exist after launch.
        </p>
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
              id="blog-consent"
              checked={formData.consent}
              onChange={handleChange}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all"
            />
            <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <label htmlFor="blog-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
            I agree to the{' '}
            <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">
              Privacy Policy
            </Link>{' '}
            and consent to CarrVin collecting and processing my information for updates and communications.
          </label>
        </div>

        {formMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm p-3 rounded-lg border text-red-400 bg-red-500/10 border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{formMessage.text}</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-dark-primary font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-amber-700/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading
            ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
            : 'Claim My Founding Spot'
          }
        </motion.button>
      </form>
    </div>
  );
};

export default BlogSignupSection;