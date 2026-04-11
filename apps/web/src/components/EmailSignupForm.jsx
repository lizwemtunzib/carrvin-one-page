import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import apiServerClient from '@/lib/apiServerClient';

const EmailSignupForm = ({
  // CHANGE 1: default buttonText updated from "Claim My Founding Spot" to "Join the Founding List"
  buttonText = "Join the Founding List",
  showNameField = true
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', consent: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (showNameField && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
    // CHANGE 3: consent is now validated
    if (!formData.consent) newErrors.consent = 'You must agree to the privacy policy to continue.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setIsPendingConfirmation(false);

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

      if (response.status === 409) {
        toast({
          variant: "destructive",
          title: "Already Registered",
          description: "This email is already registered. Check your inbox for the confirmation link.",
        });
        return;
      }

      if (response.status === 200 && data.success) {
        setIsPendingConfirmation(true);
        setFormData({ name: '', email: '', consent: false });
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPendingConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        {/* CHANGE 2: "your spot is not locked" → "your place on the founding list is not confirmed until you verify your email" */}
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
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      {showNameField && (
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`w-full px-6 py-4 bg-white border-2 [color-scheme:light] ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all duration-300`}
          />
          {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
        </div>
      )}
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email Address"
          className={`w-full px-6 py-4 bg-white border-2 [color-scheme:light] ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25 transition-all duration-300`}
        />
        {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* CHANGE 3: Consent checkbox added */}
      <div className="flex items-start gap-3 pt-1">
        <div className="relative flex items-center mt-0.5">
          <input
            type="checkbox"
            name="consent"
            id="email-signup-consent"
            checked={formData.consent}
            onChange={handleChange}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all"
          />
          <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <label htmlFor="email-signup-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
          I agree to the{' '}
          <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">
            Privacy Policy
          </Link>{' '}
          and consent to CarrVin collecting and processing my information for updates and communications.
        </label>
      </div>
      {errors.consent && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errors.consent}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-8 py-4 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-700/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading
          ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
          : buttonText
        }
      </motion.button>
    </form>
  );
};

export default EmailSignupForm;