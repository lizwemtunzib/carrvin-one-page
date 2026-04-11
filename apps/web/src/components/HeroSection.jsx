import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import EarlyAccessForm from '@/components/EarlyAccessForm.jsx';

const phrases = [
  { text: "Your Car Is Gone.", color: "text-gray-900" },
  { text: "No Alarm.", color: "text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600" },
  { text: "No Trace.", color: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800" },
  { text: "No Warning.", color: "text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-amber-600" },
];

const HeartbeatText = () => {
  const [index, setIndex] = useState(0);
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % phrases.length);
      }, 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-24 md:h-32 flex items-center justify-center">
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.08); }
          30% { transform: scale(1); }
          45% { transform: scale(1.05); }
          60% { transform: scale(1); }
        }
        .heartbeat {
          animation: heartbeat 0.6s ease-in-out;
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className={`text-5xl md:text-7xl lg:text-8xl font-bold ${phrases[index].color} ${beat ? 'heartbeat' : ''}`}
        >
          {phrases[index].text}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <style>{`
        .stamp-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transform: rotate(130deg);
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .stamp-btn:hover {
          transform: rotate(130deg) scale(1.08);
          filter: brightness(1.15);
        }

        .stamp-btn:active {
          transform: rotate(130deg) scale(0.96);
        }

        /* Outer stamp ring */
        .stamp-outer {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 3px dashed #b45309;
          padding: 6px;
          background: transparent;
          box-shadow:
            0 0 0 2px rgba(180, 83, 9, 0.15),
            inset 0 0 0 2px rgba(180, 83, 9, 0.1);
        }

        /* Serrated edge on outer ring */
        .stamp-outer::before {
          content: '';
          position: absolute;
          width: 158px;
          height: 158px;
          border-radius: 50%;
          background: repeating-conic-gradient(
            rgba(180, 83, 9, 0.12) 0deg 6deg,
            transparent 6deg 12deg
          );
          pointer-events: none;
        }

        /* Inner stamp ring — counter-rotated with slight residual tilt */
        .stamp-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2.5px solid #b45309;
          background: rgba(254, 243, 199, 0.55);
          backdrop-filter: blur(4px);
          gap: 4px;
          box-shadow:
            0 0 18px rgba(180, 83, 9, 0.2),
            inset 0 0 12px rgba(180, 83, 9, 0.08);
          overflow: hidden;
          position: relative;
          /* -115deg instead of -130deg leaves ~15deg residual tilt on the text */
          transform: rotate(-115deg);
        }

        /* Worn ink overlay */
        .stamp-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 35% 35%,
            rgba(180, 83, 9, 0.06) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        .stamp-icon {
          color: #92400e;
          opacity: 0.85;
        }

        .stamp-label {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #92400e;
          line-height: 1.15;
          text-align: center;
        }

        .stamp-sub {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b45309;
          opacity: 0.75;
          line-height: 1;
        }
      `}</style>

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1685594496584-23198309c37a"
          alt="Sleek car silhouette representing advanced vehicle security"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F0]/85 via-[#F8F6F0]/92 to-[#F8F6F0]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Logo row — stamp sits well to the left, logo centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-start mb-4"
          >
            {/* Stamp — desktop only, pushed further left */}
            <motion.div
              initial={{ opacity: 0, rotate: 110, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
              className="absolute left-[-130px] top-6 hidden md:block"
            >
              <button
                type="button"
                className="stamp-btn"
                onClick={() => {
                  const el = document.getElementById('ecosystem-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-label="View stakeholder sections"
              >
                <div className="stamp-outer">
                  <div className="stamp-inner">
                    <Users className="stamp-icon w-6 h-6" />
                    <span className="stamp-label">Stake-<br />holders</span>
                    <span className="stamp-sub">▼ view</span>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Logo — stays centered */}
            <Link to="/">
              <div className="relative">
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <clipPath id="cloudMask" clipPathUnits="objectBoundingBox">
                      <path d="M0.2,0.25 C0.1,0.25 0.02,0.35 0.02,0.48 C0.02,0.61 0.12,0.72 0.25,0.75 C0.3,0.82 0.4,0.88 0.5,0.88 C0.6,0.88 0.7,0.82 0.75,0.75 C0.88,0.72 0.98,0.61 0.98,0.48 C0.98,0.35 0.88,0.25 0.78,0.25 C0.73,0.18 0.63,0.12 0.5,0.12 C0.37,0.12 0.27,0.18 0.22,0.25 C0.21,0.25 0.21,0.25 0.2,0.25 Z" />
                    </clipPath>
                  </defs>
                </svg>
                <img
                  src="https://horizons-cdn.hostinger.com/b02ff131-21a4-468e-b0f1-523542a0597f/971a29b5ea874bf84bd7294ab09372aa.jpg"
                  alt="CarrVin Logo"
                  className="h-20 md:h-28 cursor-pointer transition duration-300 hover:opacity-100 hover:scale-105"
                  style={{
                    clipPath: 'url(#cloudMask)',
                    WebkitClipPath: 'url(#cloudMask)',
                  }}
                  onError={(e) => {
                    console.error('Logo failed to load');
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.padding = '20px';
                  }}
                />
              </div>
            </Link>
          </motion.div>

          {/* Heartbeat Headline */}
          <HeartbeatText />

          {/* Mobile stamp — centered below headline on small screens */}
          <div className="flex justify-center md:hidden">
            <button
              type="button"
              className="stamp-btn"
              onClick={() => {
                const el = document.getElementById('ecosystem-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="View stakeholder sections"
            >
              <div className="stamp-outer">
                <div className="stamp-inner">
                  <Users className="stamp-icon w-6 h-6" />
                  <span className="stamp-label">Stake-<br />holders</span>
                  <span className="stamp-sub">▼ view</span>
                </div>
              </div>
            </button>
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Over 3,100 vehicles are reported stolen every single day across just five countries.
            The methods are sophisticated. The window to act is narrow.
            Existing security was not built for this.
          </motion.p>

          {/* Hook */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 font-bold max-w-3xl mx-auto"
          >
            CarrVin is being built to close that gap, before the gap gets wider.
          </motion.p>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="pt-4"
          >
            <EarlyAccessForm />
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-sm text-gray-400 pt-2"
          >
            1,000 founding spots. Founding pricing locked in permanently. After that, this closes.
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-amber-700 opacity-60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;