import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Layers, SearchX, Wifi } from 'lucide-react';

const IndustryReadySection = () => {
  const points = [
    {
      text: "Vehicle theft rising across every major market",
      icon: TrendingUp
    },
    {
      text: "Existing solutions operate in silos — not systems",
      icon: Layers
    },
    {
      text: "Recovery rates declining as networks move faster",
      icon: SearchX
    },
    {
      text: "Connected vehicles create new attack surfaces daily",
      icon: Wifi
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-100 to-[#F8F6F0] border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
              The Problem Is Getting Worse.{' '}
              {/* CHANGE 1: "The Solutions Haven't Kept Up" → "Traditional Security Hasn't Kept Up" */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
                Traditional Security Hasn't Kept Up.
              </span>
            </h2>
            {/* CHANGE 2: "has never been wider" → "continues to widen" */}
            <p className="text-gray-600 text-lg mb-6">
              Vehicle theft is not a local problem with a local solution. It is a global, organised, technology-driven industry. The gap between what thieves can do and what owners can deploy against them continues to widen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {points.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/20 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{point.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 bg-white p-8 rounded-2xl border border-gray-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-700/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 text-center py-6">
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-3 font-medium">The CarrVin Position</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">
                Proactive. Not reactive.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
                  Before the theft. Not after.
                </span>
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Every existing solution was designed to react. CarrVin is designed to operate at the same speed as the networks targeting your vehicle — which means operating before they reach it.
              </p>
              <div className="inline-block px-5 py-2 rounded-full bg-amber-700/10 border border-amber-700/20 text-sm text-amber-700 font-medium">
                Founding list open — 1,000 spots only
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default IndustryReadySection;