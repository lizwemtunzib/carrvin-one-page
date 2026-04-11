import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-lg text-gray-600 mb-4">
        1,000 founding spots. Founding pricing locked in permanently. After that, this closes.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-dark-primary font-bold rounded-xl hover:shadow-xl hover:shadow-amber-700/20 transition-all duration-300"
      >
        Join the Founding List
      </Link>
    </motion.div>
  );
};

export default CallToAction;