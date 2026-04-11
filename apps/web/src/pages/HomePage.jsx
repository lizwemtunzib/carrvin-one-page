import React, { useState, useEffect } from 'react';
import ScrollBanner from '@/components/ScrollBanner.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProblemSection from '@/components/ProblemSection.jsx';
import ExistingSystemsSection from '@/components/ExistingSystemsSection.jsx';
import SolutionSection from '@/components/SolutionSection.jsx';
import IndustryReadySection from '@/components/IndustryReadySection.jsx';
import VehicleCrimeImpactSection from '@/components/VehicleCrimeImpactSection.jsx';
import BenefitsSection from '@/components/BenefitsSection.jsx';
import UrgencySection from '@/components/UrgencySection.jsx';
import WaitlistSection from '@/components/WaitlistSection.jsx';
import EcosystemSection from '@/components/EcosystemSection.jsx';
import Footer from '@/components/Footer.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('carrvin_cookie_consent');
      if (!consent) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('Cookie consent error:', err);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('carrvin_cookie_consent', JSON.stringify({
        accepted: true,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Cookie consent save error:', err);
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('carrvin_cookie_consent', JSON.stringify({
        accepted: false,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Cookie consent save error:', err);
    }
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-300/60 p-5 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-700" />
              </div>
              <div className="flex-grow">
                <p className="text-gray-900 font-semibold text-sm mb-1">
                  We use cookies to improve your experience.
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  CarrVin uses cookies to analyse site traffic and personalise content. We do not sell your data.
                  By continuing you agree to our{' '}
                  <Link to="/privacy" className="text-amber-700 hover:text-amber-600 underline underline-offset-2 transition-colors">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 md:flex-none px-4 py-2 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold bg-gradient-to-r from-amber-700 to-yellow-600 text-dark-primary rounded-lg hover:shadow-lg hover:shadow-amber-700/20 transition-all duration-200"
                >
                  Accept
                </button>
                <button onClick={handleDecline} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F0] text-gray-900">
      <ScrollBanner />
      <main className="flex-grow">
        <HeroSection />
        <ProblemSection />
        <ExistingSystemsSection />
        <SolutionSection />
        <IndustryReadySection />
        <VehicleCrimeImpactSection />
        <BenefitsSection />
        <UrgencySection />
        <WaitlistSection />
        <EcosystemSection />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default HomePage;