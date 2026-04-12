import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import EarlyAccessForm from '@/components/EarlyAccessForm.jsx';

const UrgencySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-16 md:py-20 bg-gradient-to-b from-[#F8F6F0] via-gray-100 to-[#F8F6F0] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-amber-700/20 to-yellow-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-600/20 to-amber-700/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold leading-tight text-gray-900"
          >
            Right Now, Someone Might Be{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800">
              Targeting Your Vehicle.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-700 leading-relaxed"
          >
            {/* CHANGE 2: "has never been wider" → "continues to widen" */}
            Not hypothetically. Relay attack networks operate continuously. Key jamming happens in every car park you use. Cloning operations run on demand. The gap between what thieves can do and what your current security stops continues to widen.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base text-gray-600 leading-relaxed"
          >
            {/* CHANGE 1: Removed mechanism-revealing line, merged into single stealth statement */}
            CarrVin is a new category of vehicle security. The founding list is limited to 1,000 members. After that, founding pricing closes permanently and will not reopen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-2"
          >
            {/* CHANGE 3: "Claim My Founding Spot" → "Join the Founding List" */}
            <EarlyAccessForm buttonText="Join the Founding List" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-500 text-sm font-semibold">
              Founding pricing closes permanently after 1,000 members. No extensions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default UrgencySection;
