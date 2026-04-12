import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowUpRight, BadgePercent, HeadphonesIcon, FlaskConical, MessageSquare } from 'lucide-react';

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const benefits = [
    {
      icon: ArrowUpRight,
      title: "Priority Access",
      description: "Skip the public queue entirely. Founding members get access the moment CarrVin launches — before anyone else."
    },
    {
      icon: BadgePercent,
      title: "Founding Pricing — Locked In",
      description: "The price you join at is the price you keep. Permanently. This rate will not exist after the founding cohort closes."
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Onboarding Support",
      description: "Founding members receive dedicated onboarding support at launch — direct access to the team, not a help desk."
    },
    {
      icon: FlaskConical,
      title: "Early Feature Access",
      description: "Founding members get access to new features before they go public — and direct visibility into what's being built."
    },
    {
      icon: MessageSquare,
      title: "Direct Input",
      description: "Your feedback shapes the product. Founding members have a seat at the table that no later member will have."
    }
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 bg-[#F8F6F0] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03] pointer-events-none z-0">
        <img
          src="https://horizons-cdn.hostinger.com/b02ff131-21a4-468e-b0f1-523542a0597f/971a29b5ea874bf84bd7294ab09372aa.jpg"
          alt=""
          className="w-full h-full object-contain mix-blend-multiply grayscale"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">
              What Founding Members Get.
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            These are not generic perks. They are the specific advantages that close permanently when the 1,000 founding spots fill.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group h-full p-6 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 hover:border-amber-700/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-700/5"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-700/20 to-yellow-600/20 border border-amber-700/20 flex items-center justify-center mb-4 group-hover:border-amber-700/50 transition-all duration-300">
                <benefit.icon className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            All founding member benefits close permanently once 1,000 spots are filled. No exceptions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
