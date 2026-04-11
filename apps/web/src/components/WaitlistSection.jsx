import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, Users, Zap } from 'lucide-react';
import EarlyAccessForm from '@/components/EarlyAccessForm.jsx';

const WaitlistSection = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<section
			ref={ref}
			className="py-24 md:py-32 bg-gradient-to-b from-gray-100 to-[#F8F6F0] relative overflow-hidden"
		>
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-amber-700/5 via-transparent to-transparent"></div>
			</div>

			<div className="relative z-10 container mx-auto px-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="max-w-3xl mx-auto text-center space-y-12"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={isInView ? { opacity: 1, scale: 1 } : {}}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="flex justify-center"
					>
						<div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-700 to-yellow-600 flex items-center justify-center">
							<Lock className="w-10 h-10 text-white" />
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="space-y-4"
					>
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-amber-700 to-yellow-600">
								1,000 Spots. Then the Door Closes.
							</span>
						</h2>
						{/* CHANGE 2: "founding members" → "the first 1,000 on the founding list" */}
						<p className="text-xl text-gray-600">
							The first 1,000 on the founding list get priority access and founding pricing — locked in permanently. After that, this offer is gone.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="pt-4"
					>
						{/* CHANGE 1: "Claim My Founding Spot" → "Join the Founding List" */}
						<EarlyAccessForm buttonText="Join the Founding List" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ duration: 0.8, delay: 0.7 }}
						className="pt-4"
					>
						<div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20">
							<Zap className="w-5 h-5 text-red-500" />
							<p className="text-red-500 font-semibold">
								Founding pricing closes permanently after the first 1,000 members
							</p>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.9 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
					>
						<div className="p-6 rounded-xl bg-white border border-gray-200">
							<Users className="w-8 h-8 text-amber-700 mx-auto mb-3" />
							<p className="text-2xl font-bold text-gray-900 mb-1">1,000</p>
							<p className="text-sm text-gray-500">Founding Spots Total</p>
						</div>
						<div className="p-6 rounded-xl bg-white border border-gray-200">
							<Lock className="w-8 h-8 text-amber-700 mx-auto mb-3" />
							<p className="text-2xl font-bold text-gray-900 mb-1">Locked In</p>
							<p className="text-sm text-gray-500">Founding Price. Forever.</p>
						</div>
						<div className="p-6 rounded-xl bg-white border border-gray-200">
							<Zap className="w-8 h-8 text-amber-700 mx-auto mb-3" />
							<p className="text-2xl font-bold text-gray-900 mb-1">Priority</p>
							<p className="text-sm text-gray-500">Access Before Public Launch</p>
						</div>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ duration: 0.8, delay: 1.1 }}
						className="text-sm text-gray-500 pt-4"
					></motion.p>
				</motion.div>
			</div>
		</section>
	);
};

export default WaitlistSection;