import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, Copy, Timer } from 'lucide-react';

const ExistingSystemsSection = () => {
  const points = [
    {
      icon: Timer,
      // CHANGE 1: "Factory GPS is defeated within the first hour" → softer, consistent with PDFs
      heading: "Conventional GPS tracking has a narrow recovery window once professional networks are involved.",
      detail: "Professional networks locate and disable trackers before most owners even realise the vehicle is gone. The recovery window closes before it opens."
    },
    {
      icon: WifiOff,
      // CHANGE 2: "Faraday pouches only work when you remember them" → consistent with PDFs
      heading: "Faraday pouches only work when used consistently.",
      detail: "Relay attacks happen the moment your key is near a door or window. One forgotten pouch, one unlocked car, one missing vehicle."
    },
    {
      icon: Copy,
      heading: "VIN checks confirm the fraud without catching it.",
      detail: "Cloned vehicles carry a real, legitimate VIN. The check passes. The history looks clean. You drive away in a stolen car."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-[#F8F6F0] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-[#F8F6F0] to-[#F8F6F0] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
            What You're Relying On{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
              Wasn't Built for This.
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Every existing solution has a ceiling. Organised theft networks already know where it is.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/20 flex items-center justify-center mb-4 group-hover:border-amber-700/40 transition-all duration-300">
                <point.icon className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 leading-snug">{point.heading}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{point.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExistingSystemsSection;
