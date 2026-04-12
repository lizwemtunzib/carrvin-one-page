import React from 'react';

const ScrollBanner = () => {
  return (
    <div className="w-full bg-[#F0EDE6] border-b border-gray-200 overflow-hidden py-3 relative z-50 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-700/5 via-transparent to-yellow-600/5 pointer-events-none" />
      <div className="whitespace-nowrap animate-scroll-text inline-block min-w-full">
        <span className="text-gray-700 font-medium text-sm md:text-base tracking-wide px-4">
          {/* CHANGE 1: "Every 28 seconds..." → annual figure with "approx." qualifier */}
          {/* CHANGE 2: "has never been wider" → "continues to widen" */}
          Approx. over 1.1 million vehicles are reported stolen every year across just five countries alone. No alarm. No trace. No warning. &nbsp;&nbsp;•&nbsp;&nbsp; Relay attacks, key jamming, cloning — the methods are sophisticated and the gap in protection continues to widen. &nbsp;&nbsp;•&nbsp;&nbsp; CarrVin is being built to close that gap. 1,000 founding spots. Then the door closes.
        </span>
      </div>
      <style>{`
        @keyframes scroll-text {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll-text {
          animation: scroll-text 45s linear infinite;
          will-change: transform;
          display: inline-block;
        }
        @media (min-width: 768px) {
          .animate-scroll-text {
            animation-duration: 50s;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollBanner;
