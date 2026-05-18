import React from 'react';
import { ChevronLeft, MapPin, Phone, Star, Zap, ShieldCheck, Clock } from 'lucide-react';
import { ChargingPoint } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HostProfileProps {
  point: ChargingPoint;
  onBack: () => void;
  onBook: () => void;
}

export default function HostProfile({ point, onBack, onBook }: HostProfileProps) {
  const calculateDistance = () => {
    if ("geolocation" in navigator) {
      // In a real app we'd pass this from Home or use a shared state
      // For the demo profile, we'll just show a randomized close distance if not available
      return (Math.random() * 2 + 0.5).toFixed(1);
    }
    return "1.2";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="relative h-64 shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1517520216447-49339e31d87e?auto=format&fit=crop&q=80&w=1000" 
          className="w-full h-full object-cover" 
          alt="Host context"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Verified Host</div>
            <div className="flex items-center gap-1 bg-amber-500/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-white" />
              <span className="text-[10px] font-bold">{point.rating}</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">{point.hostName}</h1>
        </div>
      </div>

      <div className="flex-1 px-8 pt-8 -mt-6 bg-white rounded-t-[40px] relative z-10 overflow-y-auto pb-32">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Distance</p>
            <p className="text-xl font-black text-slate-800">{calculateDistance()} km <span className="text-sm font-medium text-slate-400 italic">away</span></p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rate</p>
            <p className="text-xl font-black text-blue-600">₹{point.pricePerHour}<span className="text-sm font-medium text-slate-400">/hr</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
            <Zap className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase">Socket Type</p>
            <p className="font-black text-slate-800 tracking-tighter">{point.socketType} Universal</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
            <Clock className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
            <p className={cn(
              "font-black tracking-tighter",
              point.availabilityStatus === 'available' ? "text-green-600" : "text-red-500"
            )}>
              {point.availabilityStatus === 'available' ? 'Available Now' : 'Currently Busy'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Location</h3>
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{point.address}</p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-2">About Host</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {point.description || "A friendly local charging point for the community. Safe parking space available for 2-wheelers."}
            </p>
            <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-2xl border border-green-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <p className="text-xs font-bold text-green-700">Participating in Google AI Community Grid</p>
            </div>
          </section>

          <section className="pb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Host Contact</h3>
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-600" />
                </div>
                <span className="font-bold text-slate-700">{point.contactNumber}</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180 group-hover:text-blue-500 transition-colors" />
            </button>
          </section>
        </div>
      </div>

      <div className="absolute bottom-28 left-8 right-8 z-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (point.availabilityStatus === 'available') onBook();
          }}
          disabled={point.availabilityStatus === 'busy'}
          className={cn(
            "w-full py-5 rounded-2xl shadow-xl font-black text-lg tracking-tight flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all",
            point.availabilityStatus === 'available' ? "bg-blue-600 text-white hover:bg-blue-700" : ""
          )}
        >
          {point.availabilityStatus === 'available' ? (
            <>
              <Zap className="w-6 h-6 fill-white" />
              Reserve 1-Hour Slot
            </>
          ) : 'Point Currently Busy'}
        </motion.button>
      </div>
    </div>
  );
}
