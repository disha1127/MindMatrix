import React from 'react';
import { motion } from 'motion/react';
import { Battery, Zap } from 'lucide-react';

interface SplashProps {
  onContinue: () => void;
}

export default function Splash({ onContinue }: SplashProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-xs"
      >
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Zap className="w-12 h-12 text-green-300 fill-green-300" />
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-2">EV-Grama</h1>
        <p className="text-blue-100 text-sm font-medium mb-12 text-center leading-relaxed">
          Charge your 2-wheeler at a friendly local home or shop.
        </p>

        <div className="w-full space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="w-full bg-green-400 text-blue-900 font-bold py-5 rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-300 transition-all uppercase tracking-[0.2em] text-sm"
          >
            Enter Dashboard
          </motion.button>
          
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mt-4">
            Authorized Prototype v1.0
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Community Powered</span>
        </div>
      </div>
    </div>
  );
}
