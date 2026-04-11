import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer.jsx';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Title Section */}
          <div className="text-center space-y-6 border-b border-white/10 pb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-metallic flex items-center justify-center">
                <Shield className="w-8 h-8 text-dark-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
            <p className="text-xl text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-gold" />
                1. Introduction
              </h2>
              <p>
                Welcome to CarrVin. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit 
                our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Eye className="w-6 h-6 text-gold" />
                2. Data We Collect
              </h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-white">Identity Data:</strong> includes first name, last name, city, and country.</li>
                <li><strong className="text-white">Contact Data:</strong> includes email address.</li>
                <li><strong className="text-white">Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                <li><strong className="text-white">Usage Data:</strong> includes information about how you use our website.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Lock className="w-6 h-6 text-gold" />
                3. How We Use Your Data
              </h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>To register you as a new interested customer or early access member.</li>
                <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.</li>
                <li>To use data analytics to improve our website, products/services, marketing, customer relationships and experiences.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-gold" />
                4. Data Security
              </h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">5. Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white">6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white font-semibold">CarrVin Privacy Team</p>
                <a href="mailto:privacy@carrvin.com" className="text-metallic hover:text-gold transition-colors">privacy@carrvin.com</a>
              </div>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;