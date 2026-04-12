import React from 'react';
import { motion } from 'framer-motion';
import { Car, Factory, ShieldCheck, Landmark, Wrench, Siren } from 'lucide-react';

const VehicleCrimeImpactSection = () => {
  const stakeholders = [
    {
      title: "Vehicle Owners",
      description: "Protect your investment and peace of mind.",
      icon: <Car className="w-6 h-6" />,
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    },
    {
      title: "Manufacturers & Dealers",
      description: "Prevent losses from stolen or cloned vehicles.",
      icon: <Factory className="w-6 h-6" />,
      color: "text-purple-600",
      bg: "bg-purple-500/10"
    },
    {
      title: "Insurance Companies",
      description: "Reduce claims and fraud exposure.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Banks & Financiers",
      description: "Safeguard financed vehicles and loans.",
      icon: <Landmark className="w-6 h-6" />,
      color: "text-amber-700",
      bg: "bg-yellow-500/10"
    },
    {
      title: "Spare Parts Market",
      description: "Prevent illegal stripping and resale of parts.",
      icon: <Wrench className="w-6 h-6" />,
      color: "text-orange-600",
      bg: "bg-orange-500/10"
    },
    {
      title: "Law Enforcement",
      description: "Support faster recovery and safer communities.",
      icon: <Siren className="w-6 h-6" />,
      color: "text-red-600",
      bg: "bg-red-500/10"
    }
  ];

  return (
    <section className="py-24 bg-[#F8F6F0] relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Vehicle Crime Impacts More Than Just Owners
          </h2>
          <p className="text-xl text-gray-600">
            The ripple effects touch every corner of the automotive ecosystem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stakeholders.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={item.color}>{item.icon}</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 text-center"
        >
          {/* CHANGE: "We're building the solution" → "We're building for the ecosystem" */}
          <p className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-gray-900 to-yellow-600 inline-block border-b border-gray-200 pb-2">
            Vehicle crime is an ecosystem challenge. We're building for the ecosystem.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VehicleCrimeImpactSection;
