import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, ShieldCheck, Factory } from 'lucide-react';
import BanksSignupForm from '@/components/BanksSignupForm.jsx';
import InsuranceSignupForm from '@/components/InsuranceSignupForm.jsx';
import ManufacturersSignupForm from '@/components/ManufacturersSignupForm.jsx';

const EcosystemSection = () => {
  const [openDialog, setOpenDialog] = useState(null);
  const [hovered, setHovered] = useState(null);

  const stakeholders = [
    {
      id: 'banks',
      title: 'Banks & Lenders',
      description: 'Stop financing fraudulent vehicles. Protect your reputation and assets.',
      dialogTitle: 'Banks & Lenders Signup',
      icon: Building2,
      accent: '#b45309',
      tag: 'Financial Risk',
    },
    {
      id: 'insurance',
      title: 'Insurance Companies',
      description: 'Reduce claim payouts and boost vehicle recovery rates.',
      dialogTitle: 'Insurance Companies Signup',
      icon: ShieldCheck,
      accent: '#b45309',
      tag: 'Claims & Recovery',
    },
    {
      id: 'manufacturers',
      title: 'Vehicle Manufacturers',
      description: 'Every stolen vehicle is a lost sale. Protect your customers and revenue.',
      dialogTitle: 'Vehicle Manufacturers Signup',
      icon: Factory,
      accent: '#b45309',
      tag: 'Brand Protection',
    },
  ];

  return (
    <section
      id="ecosystem-section"
      className="bg-white border-t border-gray-200 py-20 px-6 scroll-mt-20"
    >
      <style>{`
        [data-radix-portal] .fixed.inset-0.z-50 {
          border-radius: 24px !important;
          margin: 20px !important;
          width: calc(100% - 40px) !important;
          height: calc(100% - 40px) !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
        }

        .eco-card {
          position: relative;
          width: 100%;
          max-width: 300px;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px 24px 22px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          text-align: left;
        }

        .eco-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(180, 83, 9, 0.04) 0%,
            rgba(254, 243, 199, 0.35) 100%
          );
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        /* Glowing top border line */
        .eco-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          width: 80%;
          height: 2px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(90deg, transparent, #d97706, #b45309, transparent);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .eco-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 20px 40px rgba(180, 83, 9, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.06);
          border-color: #d97706;
        }

        .eco-card:hover::before,
        .eco-card:hover::after {
          opacity: 1;
        }

        .eco-card:active {
          transform: translateY(-2px);
        }

        /* Icon container */
        .eco-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1.5px solid #fcd34d;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .eco-card:hover .eco-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
          box-shadow: 0 6px 18px rgba(217, 119, 6, 0.3);
        }

        /* Tag pill */
        .eco-tag {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #b45309;
          background: rgba(254, 243, 199, 0.8);
          border: 1px solid #fcd34d;
          border-radius: 999px;
          padding: 3px 10px;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .eco-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
          transition: color 0.2s;
        }

        .eco-card:hover .eco-title {
          color: #92400e;
        }

        .eco-desc {
          font-size: 0.82rem;
          color: #6b7280;
          line-height: 1.55;
          position: relative;
          z-index: 1;
          margin-bottom: 18px;
        }

        /* CTA row */
        .eco-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          border-top: 1px solid #f3f4f6;
          padding-top: 14px;
          transition: border-color 0.3s;
        }

        .eco-card:hover .eco-cta {
          border-top-color: #fde68a;
        }

        .eco-cta-text {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #b45309;
          transition: letter-spacing 0.25s;
        }

        .eco-card:hover .eco-cta-text {
          letter-spacing: 0.1em;
        }

        .eco-cta-arrow {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #b45309, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 2px 8px rgba(180, 83, 9, 0.3);
        }

        .eco-card:hover .eco-cta-arrow {
          transform: translateX(4px);
          box-shadow: 0 4px 14px rgba(180, 83, 9, 0.45);
        }

        /* Decorative corner accent */
        .eco-corner {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(254, 243, 199, 0.6), transparent 70%);
          pointer-events: none;
          transition: opacity 0.3s;
          opacity: 0;
        }

        .eco-card:hover .eco-corner {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
        >
          Built for the Ecosystem
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-14"
        >
          CarrVin is designed to support key stakeholders in vehicle security without exposing proprietary technology.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-6 items-center justify-center max-w-5xl mx-auto"
        >
          {stakeholders.map((stakeholder, index) => {
            const Icon = stakeholder.icon;
            return (
              <motion.div
                key={stakeholder.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.12 }}
                className="w-full md:w-auto flex justify-center"
              >
                <button
                  type="button"
                  onClick={() => setOpenDialog(stakeholder.id)}
                  onMouseEnter={() => setHovered(stakeholder.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="eco-card"
                  aria-label={`Open ${stakeholder.title} signup form`}
                >
                  {/* Decorative corner glow */}
                  <div className="eco-corner" />

                  {/* Icon */}
                  <div className="eco-icon-wrap">
                    <Icon
                      size={24}
                      strokeWidth={1.8}
                      style={{ color: '#92400e' }}
                    />
                  </div>

                  {/* Tag */}
                  <span className="eco-tag">{stakeholder.tag}</span>

                  {/* Title */}
                  <div className="eco-title">{stakeholder.title}</div>

                  {/* Description */}
                  <p className="eco-desc">{stakeholder.description}</p>

                  {/* CTA row */}
                  <div className="eco-cta">
                    <span className="eco-cta-text">Get Early Access</span>
                    <span className="eco-cta-arrow">→</span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Banks Dialog */}
      <Dialog open={openDialog === 'banks'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-md bg-amber-50 border-amber-400 shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="relative pt-2">
            <DialogTitle className="text-gray-900 text-xl font-bold">Banks & Lenders Signup</DialogTitle>
            <button
              onClick={() => setOpenDialog(null)}
              className="absolute right-4 top-0 text-black hover:text-gray-700 text-2xl font-bold z-10"
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          <BanksSignupForm closeDialog={() => setOpenDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* Insurance Dialog */}
      <Dialog open={openDialog === 'insurance'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-md bg-amber-50 border-amber-400 shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="relative pt-2">
            <DialogTitle className="text-gray-900 text-xl font-bold">Insurance Companies Signup</DialogTitle>
            <button
              onClick={() => setOpenDialog(null)}
              className="absolute right-4 top-0 text-black hover:text-gray-700 text-2xl font-bold z-10"
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          <InsuranceSignupForm closeDialog={() => setOpenDialog(null)} />
        </DialogContent>
      </Dialog>

      {/* Manufacturers Dialog */}
      <Dialog open={openDialog === 'manufacturers'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="max-w-md bg-amber-50 border-amber-400 shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="relative pt-2">
            <DialogTitle className="text-gray-900 text-xl font-bold">Vehicle Manufacturers Signup</DialogTitle>
            <button
              onClick={() => setOpenDialog(null)}
              className="absolute right-4 top-0 text-black hover:text-gray-700 text-2xl font-bold z-10"
              aria-label="Close"
            >
              ×
            </button>
          </DialogHeader>
          <ManufacturersSignupForm closeDialog={() => setOpenDialog(null)} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EcosystemSection;
