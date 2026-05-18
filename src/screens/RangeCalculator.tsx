import React, { useState } from 'react';
import { Battery, Zap, Info, ArrowUpRight, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function RangeCalculator() {
  const [batterySize, setBatterySize] = useState<number>(3.5); // kWh
  const [currentPercent, setCurrentPercent] = useState<number>(20);
  const [duration, setDuration] = useState<number>(60); // mins
  const [socketType, setSocketType] = useState<'5A' | '15A'>('5A');

  // Simple math logic for demo
  const chargingPower = socketType === '5A' ? 1.1 : 3.3; // kW
  const efficiency = 0.85; // 85% charging efficiency
  const rangePerKwh = 18; // approx km per kWh for a 2-wheeler

  const energyGained = (chargingPower * (duration / 60)) * efficiency;
  const percentGained = (energyGained / batterySize) * 100;
  const rangeGained = energyGained * rangePerKwh;
  
  const finalPercent = Math.min(100, currentPercent + percentGained);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white p-8 shrink-0 border-b border-slate-100 rounded-b-[40px] shadow-sm">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Range Estimator</h3>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Plan your charge duration</p>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto pb-32">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Battery</label>
            <div className="text-sm font-black text-slate-900">{currentPercent}% <span className="text-slate-400 font-medium">Remaining</span></div>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
             <div className={cn("h-full transition-all duration-500", currentPercent < 20 ? "bg-red-500" : "bg-slate-400")} style={{ width: `${currentPercent}%` }}></div>
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${percentGained}%` }}
               className="h-full bg-blue-500 relative"
             >
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
             </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col items-center text-center">
             <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Duration</div>
             <div className="text-base font-black text-slate-800">{duration} mins</div>
           </div>
           <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col items-center text-center">
             <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Socket</div>
             <div className="text-base font-black text-slate-800">{socketType}</div>
           </div>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center justify-between shadow-sm relative overflow-hidden">
           <div className="absolute -right-2 -bottom-2 opacity-5">
             <Zap className="w-20 h-20 text-green-900" />
           </div>
           <div className="relative z-10">
             <div className="text-[9px] text-green-700 font-black uppercase tracking-widest mb-1">Extra Range</div>
             <div className="text-3xl font-black text-green-800 tracking-tighter flex items-end gap-1">
               +{Math.round(rangeGained)} <span className="text-sm pb-1">km</span>
             </div>
           </div>
           <div className="w-12 h-12 bg-green-200 rounded-2xl flex items-center justify-center text-green-700">
             <Zap className="w-6 h-6 fill-green-700" />
           </div>
        </div>

        {/* Sliders for the calculator */}
        <section className="space-y-6 pt-4 bg-white p-6 rounded-3xl border border-slate-100">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Battery Size</label>
              <span className="text-xs font-black text-blue-600">{batterySize} kWh</span>
            </div>
            <input 
              type="range" min="1" max="10" step="0.5" 
              value={batterySize} onChange={(e) => setBatterySize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charge Duration</label>
              <div className="flex gap-2">
                {[30, 60, 90].map(m => (
                  <button 
                    key={m}
                    onClick={() => setDuration(m)}
                    className={cn(
                      "text-[10px] font-black px-2 py-1 rounded transition-colors",
                      duration === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <input 
              type="range" min="15" max="180" step="15" 
              value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </section>

        <div className="pt-4">
           <button 
             onClick={() => window.history.back()}
             className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] flex items-center justify-center gap-2"
           >
             Book Now
             <ArrowUpRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
