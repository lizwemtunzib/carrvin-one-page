import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

const PDFConfirmationPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    console.log('🔍 PDFConfirmationPage mounted, token:', token);

    const verifyToken = async () => {
      try {
        if (!token) {
          setStatus('error');
          setErrorMsg('No confirmation token provided.');
          return;
        }

        console.log('📡 Calling backend to confirm token...');
        const response = await apiServerClient.fetch('/pdf/confirm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        console.log('Backend response:', data);

        if (response.status === 404) {
          setStatus('error');
          setErrorMsg('This link is invalid or has already been used.');
          return;
        }

        if (response.status === 410) {
          setStatus('expired');
          setErrorMsg('This link has expired. Please request a new one.');
          return;
        }

        if (!response.ok) {
          setStatus('error');
          setErrorMsg('Something went wrong. Please try again.');
          return;
        }

        if (data.pdfUrl) {
          setPdfUrl(data.pdfUrl);
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = data.pdfUrl;
            link.download = 'CarrVin-Vehicle-Security-Report.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('✅ Download triggered');
          }, 500);
        }

        setStatus('success');
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <Helmet>
        <title>Confirm Email - CarrVin</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {status === 'loading' && (
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Link...</h2>
            <p className="text-gray-400">Please wait while we confirm your email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Confirmed!</h2>
            <p className="text-gray-300 mb-6">
              Your download should start automatically. If it does not, click the button below.
            </p>
            {pdfUrl && (
              <a
                href={pdfUrl}
                download="CarrVin-Vehicle-Security-Report.pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                <Download className="w-5 h-5" />
                Download My Report
              </a>
            )}
            {!pdfUrl && (
              <p className="text-yellow-400 text-sm mt-2">
                Report not yet uploaded. Please contact hello@carrvin.com
              </p>
            )}
          </div>
        )}

        {(status === 'error' || status === 'expired') && (
          <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h2>
            <p className="text-gray-300 mb-6">{errorMsg}</p>
            <div className="space-y-3">
              <Link
                to="/download-pdf"
                className="block px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                Request New Link
              </Link>
              <Link to="/" className="block text-gray-400 hover:text-amber-500 transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PDFConfirmationPage;

