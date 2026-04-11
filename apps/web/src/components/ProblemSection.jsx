import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Radio, ScanLine, KeyRound, CarFront } from 'lucide-react';

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const problems = [
    {
      icon: Radio,
      question: "Your car vanished — no broken glass, no forced entry, no alarm.",
      detail: "Relay attacks silently extend your key signal from inside your home. The car was gone before you knew it started."
    },
    {
      icon: KeyRound,
      question: "You pressed lock. The door was never locked.",
      detail: "Key jamming floods your fob's frequency at the exact moment you press the button. The signal never reaches the car."
    },
    {
      icon: ScanLine,
      question: "The car you bought turned out to belong to someone else.",
      detail: "Cloned vehicles carry legitimate VINs. Standard pre-purchase checks confirm the fraud without knowing it."
    },
    {
      icon: CarFront,
      question: "By the time you reported it, the car was already across a border.",
      // CHANGE 1: "The recovery window closes fast" → "The recovery window is narrow"
      detail: "Professional networks strip, export, or reclone a vehicle within hours. The recovery window is narrow."
    }
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 bg-gradient-to-b from-[#F8F6F0] to-gray-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              This Is How It Actually Happens.
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Not what you imagine. What organised theft networks actually do — every day, at scale.
            </p>
          </div>

          <div className="space-y-4">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-white border border-gray-200 hover:border-amber-700/30 hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/20 flex items-center justify-center group-hover:border-amber-700/40 transition-all duration-300">
                  <problem.icon className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold mb-1 leading-snug">{problem.question}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{problem.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;