import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, AlertCircle, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/30 transition-all";

const PDFDownloadPage = ({
  recordId = "37wut0fydp3ux2w",
  pageTitle = "The CarrVin Vehicle Security Report",
  pageDescription = "What organised theft networks actually do — and what existing security cannot stop. Enter your details below to download instantly.",
  downloadFileName = "CarrVin-Vehicle-Security-Report.pdf",
  mailerliteGroupId = "180840110108968144",
  mailerliteSource = "pdf_download_page",
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', car: '', consent: false });
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showManualDownload, setShowManualDownload] = useState(false);
  const [manualDownloadUrl, setManualDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'name' && nameError) setNameError('');
    if (name === 'email' && emailError) setEmailError('');
    if (name === 'consent' && consentError) setConsentError('');
  };

  const downloadPDF = async () => {
    try {
      const PB_URL = import.meta.env.VITE_POCKETBASE_URL;
      if (!PB_URL) throw new Error("VITE_POCKETBASE_URL is not defined");
      const res = await fetch(`${PB_URL}/api/collections/resources/records/${recordId}`);
      if (!res.ok) throw new Error(`Failed to fetch PDF record: ${res.status}`);
      const record = await res.json();
      if (!record.file) throw new Error("PDF file missing in record");
      const pdfUrl = `${PB_URL}/api/files/${record.collectionId}/${record.id}/${record.file}`;
      const pdfWindow = window.open(pdfUrl, "_blank");
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          if (document.hasFocus()) {
            setShowManualDownload(true);
            setManualDownloadUrl(pdfUrl);
          }
        }, 1500);
      }
      return pdfUrl;
    } catch (err) {
      console.error("❌ Download error:", err);
      throw err;
    }
  };

  const forceDownload = async (pdfUrl, fileName) => {
    try {
      setShowManualDownload(false);
      setIsLoading(true);
      setError('⏳ Preparing download...');
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'carrvin-security-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setError('');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Force download failed:", error);
      setError('❌ Download failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNameError('');
    setEmailError('');
    setConsentError('');
    setShowSuccessMessage(false);
    setShowManualDownload(false);

    let isValid = true;
    if (!formData.name.trim()) { setNameError('Full Name is required.'); isValid = false; }
    if (!formData.email.trim()) { setEmailError('Email Address is required.'); isValid = false; }
    else if (!validateEmail(formData.email)) { setEmailError('Please enter a valid email address.'); isValid = false; }
    // CHANGE 2: Validate consent instead of hardcoding true
    if (!formData.consent) { setConsentError('You must agree to the privacy policy to continue.'); isValid = false; }
    if (!isValid) return;

    setIsLoading(true);

    try {
      try {
        await pb.collection('pdf_downloads').create({
          email: formData.email,
          name: formData.name,
          token: crypto.randomUUID(),
          confirmed: true,
          downloaded_at: new Date().toISOString()
        }, { $autoCancel: false });
      } catch (pbError) {
        console.log('⚠️ PocketBase save failed (non-fatal):', pbError);
      }

      try {
        const subResponse = await apiServerClient.fetch('/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            car: formData.car,
            groupId: mailerliteGroupId,
            source: mailerliteSource,
            privacy_consent: formData.consent
          })
        });
        const subResult = await subResponse.json();
        console.log('✅ MailerLite subscribe result:', subResult);
      } catch (subError) {
        console.log('⚠️ MailerLite subscription failed (non-fatal):', subError);
      }

      await downloadPDF();

      setShowSuccessMessage(true);
    } catch (err) {
      console.error('❌ Error processing request:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-900">
      <Helmet>
        <title>{pageTitle} — CarrVin</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-700 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-700/20">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
              {pageTitle}
            </h1>
            <p className="text-gray-600 text-lg">
              {pageDescription}
            </p>

            <p className="text-gray-700 text-base mt-3 font-medium">
              Most drivers only know 2 or 3 of these theft methods.
            </p>
          </div>

          {!showSuccessMessage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-gray-200 rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    spellCheck={false}
                    autoComplete="off"
                    className={`${inputClass} ${nameError ? 'border-red-500' : ''}`}
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {nameError}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address *"
                    autoComplete="email"
                    className={`${inputClass} ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {emailError}
                    </p>
                  )}
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

                {/* CHANGE 2: Consent checkbox added */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      name="consent"
                      id="pdf-consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all"
                    />
                    <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <label htmlFor="pdf-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                    I agree to the{' '}
                    <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">
                      Privacy Policy
                    </Link>{' '}
                    and consent to CarrVin collecting and processing my information for updates and communications.
                  </label>
                </div>
                {consentError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {consentError}
                  </p>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-amber-700/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
                  ) : (
                    <><Download className="w-5 h-5" /><span>Download Report Now</span></>
                  )}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-4 text-center">
                ℹ️ If PDF does not open, check if pop-ups are blocked and allow them for this site.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-amber-700/20 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-amber-700/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">You Are Now Informed.</h3>
              {/* CHANGE 3: "among the few who understand exactly" → "better informed about how modern vehicle theft actually works" */}
              {/* CHANGE 1: "CarrVin is building the solution" → "CarrVin is building for what exists now" */}
              <p className="text-gray-600 mb-4">
                Your report is opening now. You are now better informed about how modern vehicle theft
                actually works — and what existing security cannot stop.
                CarrVin is building for what exists now.
              </p>

              {showManualDownload && (
                <div className="bg-amber-700/5 border border-amber-700/20 rounded-lg p-4 mb-4">
                  <p className="text-amber-700 mb-2 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Pop-up was blocked by your browser
                  </p>
                  <button
                    onClick={() => forceDownload(manualDownloadUrl, downloadFileName)}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-lg hover:shadow-amber-700/20 disabled:opacity-50"
                  >
                    {isLoading ? 'Downloading...' : '📥 Click Here to Download Manually'}
                  </button>
                </div>
              )}

              <p className="text-amber-700 mb-4">
                Follow the latest at{' '}
                <a href="https://carrvin.com" className="underline font-bold text-amber-800">
                  carrvin.com
                </a>
              </p>
              <button
                onClick={() => {
                  setShowSuccessMessage(false);
                  setShowManualDownload(false);
                  setFormData({ name: '', email: '', car: '', consent: false });
                }}
                className="text-amber-700 hover:text-amber-800 underline transition-colors"
              >
                Download Another Copy
              </button>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-500 hover:text-amber-700 transition-colors inline-flex items-center gap-2">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFDownloadPage;

