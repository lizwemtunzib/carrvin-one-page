import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import HomePage from '@/pages/HomePage.jsx';
import PrivacyPage from '@/pages/PrivacyPage.jsx';
import BlogListPage from '@/pages/BlogListPage.jsx';
import BlogPostPage from '@/pages/BlogPostPage.jsx';
import AdminLoginPage from '@/pages/AdminLoginPage.jsx';
import AdminBlogPage from '@/pages/AdminBlogPage.jsx';
import PDFDownloadPage from '@/pages/PDFDownloadPage.jsx';
import PDFConfirmationPage from '@/pages/PDFConfirmationPage.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import EarlyAccessPopup from '@/components/EarlyAccessPopup.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const FloatingHomeButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isHomePage || isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/')}
          title="Go to Home"
          className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-amber-600/30 text-amber-700 shadow-lg shadow-gray-300/40 hover:bg-amber-50 hover:border-amber-600 hover:shadow-amber-200/40 transition-all duration-200 group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const TopNav = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPdfRoute = location.pathname.startsWith('/download-pdf')
    || location.pathname.startsWith('/confirm-pdf')
    || location.pathname.startsWith('/14-ways');
  const isInsightsRoute = location.pathname.startsWith('/insights');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminRoute || isPdfRoute || isInsightsRoute) return null;

  return (
    <nav className={`fixed top-10 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#F8F6F0]/90 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'
    }`}>
      <style>{`
        @keyframes slowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .slow-pulse {
          animation: slowPulse 2s ease-in-out infinite;
        }
        .slow-pulse:hover {
          animation: none;
          opacity: 1;
        }
      `}</style>
      <div className="container mx-auto px-6 py-4 flex items-center justify-center">
        <Link
          to="/insights"
          className="slow-pulse relative text-sm font-semibold px-5 py-2 rounded-full border border-amber-600/60 text-amber-700 hover:border-amber-700 hover:text-amber-800 hover:bg-amber-50 hover:scale-105 transition-all duration-300"
        >
          <span className="mr-2">&#9656;</span>
          Know Your Car's Risk
          <span className="ml-2">&#9666;</span>
        </Link>
      </div>
    </nav>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPdfRoute = location.pathname.startsWith('/download-pdf')
    || location.pathname.startsWith('/confirm-pdf')
    || location.pathname.startsWith('/14-ways');

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-900 overflow-x-hidden">
      <ScrollToTop />
      <TopNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/insights" element={<BlogListPage />} />
        <Route path="/insights/:slug" element={<BlogPostPage />} />
        <Route path="/download-pdf" element={<PDFDownloadPage />} />
        <Route path="/confirm-pdf/:token" element={<PDFConfirmationPage />} />
        <Route
          path="/14-ways"
          element={
            <PDFDownloadPage
              recordId="oqwpnj0947iz1ys"
              pageTitle="14 Ways Your Car Can Be Stolen"
              pageDescription="From hotwiring to CAN bus injection — the complete threat landscape every driver must understand."
              downloadFileName="CarrVin-14-Ways-Report.pdf"
              mailerliteGroupId="181355137395066493"
              mailerliteSource="pdf_download_14ways"
            />
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/blog" element={
          <ProtectedRoute>
            <AdminBlogPage />
          </ProtectedRoute>
        } />
      </Routes>
      {!isAdminRoute && !isPdfRoute && <EarlyAccessPopup />}
      <FloatingHomeButton />
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Helmet>
        <title>CarrVin - The Future of Vehicle Security</title>
        <meta name="description" content="Revolutionary vehicle security technology is coming. Join the exclusive early access waiting list and be among the first to experience unprecedented automotive protection." />
        <meta name="keywords" content="vehicle security, car tracking, anti-theft, CarrVin, automotive protection" />
        <meta property="og:title" content="CarrVin - The Future of Vehicle Security" />
        <meta property="og:description" content="Revolutionary vehicle security technology is coming. Join the exclusive early access waiting list." />
        <meta property="og:type" content="website" />
      </Helmet>
      <AppContent />
    </Router>
  );
}

export default App;

