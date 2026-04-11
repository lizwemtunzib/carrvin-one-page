import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, Eye, Server, Share2, UserCheck, Cookie, Mail } from 'lucide-react';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {/* FIX 10: emerald → gold brand colour */}
                  <Shield className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-gray-300 leading-relaxed">
                <div className="space-y-4">
                  {/* FIX 1: Hardcoded date — dynamic date was legally indefensible */}
                  <p className="text-sm text-gray-400">Last Updated: 1 December 2025</p>
                  <p>
                    At CarrVin, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you join our founding list or interact with our services.
                  </p>
                </div>

                {/* Section 1: Information We Collect */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Eye className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">1. Information We Collect</h3>
                  </div>
                  <p>
                    We collect information that you voluntarily provide to us when you join our founding list. This includes:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>City and Country of residence</li>
                    <li>Any other information you choose to provide in communications with us</li>
                  </ul>
                </section>

                {/* Section 2: How We Use Your Information */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <UserCheck className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">2. How We Use Your Information</h3>
                  </div>
                  {/* FIX 4: Lawful basis stated as required by GDPR Article 6 */}
                  <p>
                    We process your personal data on the lawful basis of consent, which you provide when joining the founding list. The information we collect is used for the following purposes:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>To manage your place on the CarrVin founding list.</li>
                    <li>To send you updates, newsletters, and information related to our launch.</li>
                    <li>To improve our website and services based on user demographics and interests.</li>
                    <li>To communicate with you regarding your inquiries or support requests.</li>
                  </ul>
                </section>

                {/* Section 3: Data Storage and Security */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Server className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">3. Data Storage and Security</h3>
                  </div>
                  <p>
                    We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Your data is stored securely on encrypted servers. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                  {/* FIX 5: Data retention period added */}
                  <p>
                    We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, or until you request deletion.
                  </p>
                  {/* FIX 9: International transfer disclosure added */}
                  <p>
                    Your data may be processed on servers located outside your country of residence. Where this occurs, we ensure appropriate safeguards are in place to protect your personal information.
                  </p>
                </section>

                {/* Section 4: Sharing of Information */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Share2 className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">4. Sharing of Information</h3>
                  </div>
                  <p>
                    We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates for the purposes outlined above.
                  </p>
                  {/* FIX 2: "advertisers" removed — no advertising relationships exist */}
                  {/* FIX 6: MailerLite disclosed as required under GDPR */}
                  <p>
                    We use MailerLite to manage email communications. Your data is processed by MailerLite in accordance with their privacy policy. No other third-party processors have access to your personal data.
                  </p>
                </section>

                {/* Section 5: Your Rights */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Lock className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">5. Your Rights</h3>
                  </div>
                  <p>
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                    <li>Access the personal data we hold about you.</li>
                    <li>Request correction of any incorrect or incomplete data.</li>
                    <li>Request deletion of your personal data from our records.</li>
                    <li>Withdraw your consent for marketing communications at any time by clicking the "unsubscribe" link in our emails.</li>
                    {/* FIX 7: Right to portability and right to object added — required under GDPR */}
                    <li>Request a portable copy of your personal data in a commonly used, machine-readable format.</li>
                    <li>Object to the processing of your personal data where we rely on legitimate interests as our lawful basis.</li>
                    {/* FIX 8: Supervisory authority reference added — required under GDPR and POPIA */}
                    <li>Lodge a complaint with a relevant supervisory authority, including the UK Information Commissioner's Office (ICO) or the South African Information Regulator, if you believe your data has been handled unlawfully.</li>
                  </ul>
                </section>

                {/* Section 6: Cookies and Tracking */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Cookie className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">6. Cookies and Tracking</h3>
                  </div>
                  <p>
                    Our website may use "cookies" to enhance user experience. Your web browser places cookies on your hard drive for record-keeping purposes and sometimes to track information about them. You may choose to set your web browser to refuse cookies or to alert you when cookies are being sent. If you do so, note that some parts of the site may not function properly.
                  </p>
                </section>

                {/* Section 7: Consent */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <UserCheck className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">7. Consent</h3>
                  </div>
                  {/* FIX 3: Implied consent via use removed — GDPR requires explicit affirmative consent */}
                  <p>
                    Where we rely on consent as our lawful basis for processing, we will always ask for it explicitly before collecting your data. You are never required to consent as a condition of simply browsing this website.
                  </p>
                </section>

                {/* Section 8: Contact Us */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Mail className="w-5 h-5" />
                    <h3 className="text-lg font-semibold text-white">8. Contact Us</h3>
                  </div>
                  <p>
                    If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:
                  </p>
                  {/* FIX 10: emerald → gold brand colour */}
                  <a href="mailto:hello@carrvin.com" className="text-yellow-400 hover:text-yellow-300 underline font-medium">
                    hello@carrvin.com
                  </a>
                </section>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal;