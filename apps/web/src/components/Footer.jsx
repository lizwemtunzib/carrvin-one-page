import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal.jsx';

const Footer = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <React.Fragment>
      <footer className="bg-[#F0EDE6] border-t border-gray-200 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div className="space-y-4">
              <Link 
                to="/" 
                onClick={scrollToTop}
                className="inline-flex items-center justify-center gap-3 group"
              >
                <div className="relative">
                  {/* SVG Cloud Mask - Same as hero section */}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <clipPath id="footerCloudMask" clipPathUnits="objectBoundingBox">
                        {/* Symmetrical cloud shape - visually centered */}
                        <path d="M0.2,0.25 C0.1,0.25 0.02,0.35 0.02,0.48 C0.02,0.61 0.12,0.72 0.25,0.75 C0.3,0.82 0.4,0.88 0.5,0.88 C0.6,0.88 0.7,0.82 0.75,0.75 C0.88,0.72 0.98,0.61 0.98,0.48 C0.98,0.35 0.88,0.25 0.78,0.25 C0.73,0.18 0.63,0.12 0.5,0.12 C0.37,0.12 0.27,0.18 0.22,0.25 C0.21,0.25 0.21,0.25 0.2,0.25 Z" />
                      </clipPath>
                    </defs>
                  </svg>
                  
                  <img
                    src="https://horizons-cdn.hostinger.com/b02ff131-21a4-468e-b0f1-523542a0597f/971a29b5ea874bf84bd7294ab09372aa.jpg"
                    alt="CarrVin Logo"
                    className="h-12 w-auto cursor-pointer transition duration-300 group-hover:opacity-100 group-hover:scale-105"
                    style={{
                      clipPath: 'url(#footerCloudMask)',
                      WebkitClipPath: 'url(#footerCloudMask)',
                    }}
                    onError={(e) => {
                      console.error('Footer logo failed to load');
                      e.target.style.backgroundColor = '#f0f0f0';
                      e.target.style.padding = '10px';
                    }}
                  />
                </div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600 group-hover:opacity-80 transition-opacity">
                  CarrVin
                </h3>
              </Link>
              <p className="text-xl text-gray-600">
                Proactive vehicle security. Built for the threat that exists now.
              </p>
            </div>

            <div className="w-24 h-1 bg-gradient-to-r from-amber-700 to-yellow-600 mx-auto rounded-full"></div>

            <div className="space-y-3">
              <p className="text-gray-600">Questions? We would love to hear from you.</p>
              
              {/* Fixed: Added missing <a> opening tag */}
              <a
                href="mailto:hello@carrvin.com"
                className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">hello@carrvin.com</span>
              </a>
            </div>

            <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-sm text-gray-500">
                  {new Date().getFullYear()} CarrVin. All rights reserved.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Proactive vehicle security. Built for the threat that exists now.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <Link
                  to="/insights"
                  className="text-sm text-gray-500 hover:text-amber-700 transition-colors"
                >
                  Know Your Car Risk
                </Link>

                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-sm text-gray-500 hover:text-amber-700 transition-colors flex items-center gap-2 group"
                >
                  <Shield className="w-4 h-4 group-hover:text-amber-700 transition-colors" />
                  Privacy Policy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </React.Fragment>
  );
};

export default Footer;