import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, AlertCircle, Loader2, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-400 shadow-sm rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/25 transition-all [color-scheme:light]";

const PDFDownloadPage = ({
  pdfUrl = "/pdfs/carrvin-pocket-guide.pdf",
  pageTitle = "The CarrVin Vehicle Security Report",
  pageDescription = "What organised theft networks actually do — and what existing security cannot stop. Enter your details below to download instantly.",
  downloadFileName = "CarrVin-Vehicle-Security-Report.pdf",
  mailerliteGroupId = "180840110108968144",
  mailerliteSource = "pdf_download_page",
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', car: '', name: '', consent: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showManualDownload, setShowManualDownload] = useState(false);
  const [manualDownloadUrl, setManualDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const downloadPDF = async () => {
    try {
      const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`;
      const pdfWindow = window.open(fullUrl, '_blank');
      if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed === 'undefined') {
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
      return fullUrl;
    } catch (err) {
      console.error('Download error:', err);
      const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`;
      setShowManualDownload(true);
      setManualDownloadUrl(fullUrl);
      throw err;
    }
  };

  const forceDownload = async (url, fileName) => {
    try {
      setShowManualDownload(false);
      setIsLoading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'carrvin-security-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Force download failed:', error);
      setError('Download failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  // Step 1 — capture email immediately
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      await apiServerClient.fetch('/mailerlite/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, privacy_consent: true, groupId: mailerliteGroupId, source: mailerliteSource })
      });
    } catch (err) { /* non-fatal */ } finally {
      setIsLoading(false);
      setStep(2);
    }
  };

  // Final submit — full data + download
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.consent) {
      setError('You must agree to the privacy policy to continue.');
      return;
    }
    setIsLoading(true);
    try {
      try {
        await pb.collection('pdf_downloads').create({
          email: formData.email, name: formData.name,
          token: crypto.randomUUID(), confirmed: true,
          downloaded_at: new Date().toISOString()
        }, { $autoCancel: false });
      } catch (pbError) {
        console.log('PocketBase save failed (non-fatal):', pbError);
      }

      try {
        await apiServerClient.fetch('/mailerlite/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email, name: formData.name, car: formData.car,
            groupId: mailerliteGroupId, source: mailerliteSource, privacy_consent: formData.consent
          })
        });
      } catch (subError) {
        console.log('MailerLite update failed (non-fatal):', subError);
      }

      await downloadPDF();
      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Error processing request:', err);
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">

          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-700 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-700/20">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">{pageTitle}</h1>
            <p className="text-gray-600 text-lg">{pageDescription}</p>
            <p className="text-gray-700 text-base mt-3 font-medium">Most drivers only know 2 or 3 of these theft methods.</p>
          </div>

          {!showSuccessMessage ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-200 rounded-2xl p-8">

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {[1,2,3].map(s => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-amber-600' : s < step ? 'w-3 bg-amber-400' : 'w-3 bg-gray-300'}`} />
                ))}
              </div>

              <AnimatePresence mode="wait">

                {/* Step 1 — Email */}
                {step === 1 && (
                  <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="space-y-3">
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your email address *" autoComplete="email" autoFocus className={inputClass} />
                    {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</p>}
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><Download className="w-5 h-5" /><span>Get My Free Report</span><ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </motion.form>
                )}

                {/* Step 2 — Car */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">What car do you drive?</p>
                    <input type="text" name="car" value={formData.car} onChange={handleChange} placeholder="e.g. Toyota Hilux, BMW X5" spellCheck={false} autoFocus className={inputClass} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all">Skip</button>
                      <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <span>Next</span><ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 — Name + Consent + Download */}
                {step === 3 && (
                  <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">Your name? (optional)</p>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" spellCheck={false} autoComplete="name" autoFocus className={inputClass} />
                    <div className="flex items-start gap-3 pt-1">
                      <div className="relative flex items-center mt-0.5">
                        <input type="checkbox" name="consent" id="pdf-consent" checked={formData.consent} onChange={handleChange} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-400 bg-white checked:border-amber-700 checked:bg-amber-700 transition-all" />
                        <CheckCircle2 className="pointer-events-none absolute h-3.5 w-3.5 left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <label htmlFor="pdf-consent" className="text-sm text-gray-600 text-left leading-tight cursor-pointer select-none">
                        I agree to the{' '}
                        <Link to="/privacy" className="text-amber-600 hover:text-amber-700 underline decoration-1 underline-offset-2 transition-colors">Privacy Policy</Link>{' '}
                        and consent to CarrVin collecting and processing my information.
                      </label>
                    </div>
                    {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</p>}
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><Download className="w-5 h-5" /><span>Download Report Now</span></>}
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
              <p className="text-xs text-gray-400 mt-4 text-center">If PDF does not open, check if pop-ups are blocked and allow them for this site.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-amber-700/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-700/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">You Are Now Informed.</h3>
              <p className="text-gray-600 mb-4">Your report is opening now. You are now better informed about how modern vehicle theft actually works — and what existing security cannot stop. CarrVin is building for what exists now.</p>
              {showManualDownload && (
                <div className="bg-amber-700/5 border border-amber-700/20 rounded-lg p-4 mb-4">
                  <p className="text-amber-700 mb-2 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />Pop-up was blocked by your browser
                  </p>
                  <button onClick={() => forceDownload(manualDownloadUrl, downloadFileName)} disabled={isLoading}
                    className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-lg disabled:opacity-50">
                    {isLoading ? 'Downloading...' : 'Click Here to Download Manually'}
                  </button>
                </div>
              )}
              <p className="text-amber-700 mb-4">Follow the latest at{' '}<a href="https://carrvin.com" className="underline font-bold text-amber-800">carrvin.com</a></p>
              <button onClick={() => { setShowSuccessMessage(false); setShowManualDownload(false); setFormData({ email: '', car: '', name: '', consent: false }); setStep(1); }}
                className="text-amber-700 hover:text-amber-800 underline transition-colors">
                Download Another Copy
              </button>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-500 hover:text-amber-700 transition-colors inline-flex items-center gap-2">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PDFDownloadPage;