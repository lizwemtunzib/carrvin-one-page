import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ShieldCheck } from 'lucide-react';

const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1601315385416-85b511407200"
          alt="Advanced vehicle security technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F6F0]/90 via-[#F8F6F0]/95 to-[#F8F6F0]/90"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800">
              CarrVin Is Being Built for the Threat That Exists Now.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Not the threat from a decade ago. The one operating right now — relay attacks, signal jamming, VIN cloning, organised export networks — moving faster than any reactive system can follow.
            </p>
            {/* CHANGE: Replaced mechanism-revealing copy with stealth Option C */}
            <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
              CarrVin is a new category of vehicle security. The founding list is open now. The details come with launch.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionSection;